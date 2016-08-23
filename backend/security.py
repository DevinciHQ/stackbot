import time
from google.appengine.api import urlfetch
import jwt
from  urlparse import urlparse
import json

# These items are needed to use the RS256 Algorithm.
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm
jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))


class PublicKey:
    # This is called only the first time that the class is called.
    # It initializes the default values.
    def __init__(self):
        self._expires = None
        self._keys = {}
        self.RFC_1123_FORMAT = "%a, %d %b %Y %H:%M:%S GMT"
        self._url = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

    # This is called everytime the class is called.
    def __call__(self, kid):
        return self.get_public_cert(kid)

    # Grabs the google certs from the cache or refreshes if they're missing or expired.
    def get_certs(self):

        now = time.gmtime()
        if self._expires is None or self._expires <= now:
            self.refresh()

        return self._keys

    # Updates the cache of public google certs
    def refresh(self):
        res = urlfetch.Fetch(self._url)
        expires = res.headers.data['expires']
        self._expires = time.strptime(expires, self.RFC_1123_FORMAT)
        self._keys = json.loads(res.content)

    # Converts a public x509 cert into a public RSA key.
    def conv_509_to_RSA(self, cert):
        from Crypto.Util.asn1 import DerSequence
        from Crypto.PublicKey import RSA
        from binascii import a2b_base64

        # Convert from PEM to DER
        lines = cert.replace(" ", '').split()
        der = a2b_base64(''.join(lines[1:-1]))

        # Extract subjectPublicKeyInfo field from X.509 certificate (see RFC3280)
        cert = DerSequence()
        cert.decode(der)
        tbsCertificate = DerSequence()
        tbsCertificate.decode(cert[0])
        subjectPublicKeyInfo = tbsCertificate[6]

        # Initialize RSA key
        rsa_key = RSA.importKey(subjectPublicKeyInfo)
        return rsa_key

    # Pulls the public cert from the list of certs provided by google.
    def get_public_cert(self, kid):
        keys = self.get_certs()
        if kid not in keys.keys():
            raise Exception("kid not found in accepted public keys")

        cert = keys[kid]
        pubkey = self.conv_509_to_RSA(cert)
        return pubkey.publickey().exportKey()


# Takes a request and returns the payload of the Authorization JWT token,
# including verifying it against google's public keys.
def verify_request(request):

    # Make sure we actually have an Authorization header.
    auth_header = request.headers.get('Authorization', False)
    if not auth_header:
        raise Exception("Authorization header is missing.")

    # Pull out the token from the Authorization header.
    parts = auth_header.split(" ")
    if parts[0] != 'Bearer':
        raise Exception("Authorization header is not of type 'Bearer'.")
    if not parts[1] or len(parts[1]) <= 0:
        raise Exception("Authorization header is missing token.")
    raw_token = parts[1]

    # Decode the token without verification so that we can get the key id.
    jwt_header = jwt.get_unverified_header(raw_token)
    kid = jwt_header.get('kid', None)
    if not kid:
        raise Exception("kid jwt header is missing.")

    # Check the the algorithm matches.
    alg = jwt_header.get('alg', None)
    if not alg:
        raise Exception("alg jwt header is missing.")
    if alg != 'RS256':
        raise Exception("alg jwt header should be RS256, but is not.")

    # use the global pubkey object to fetch the key that matches the key id.
    global pubkey
    key = pubkey(kid)

    # Finally decode the token using the RS256 algorithm, the devinci-stackbot audience, and the google public key.
    verified_decoded_token = jwt.decode(raw_token, key, algorithms=['RS256'], audience='devinci-stackbot')
    return verified_decoded_token

# Return the object after setting the CORS header.
def set_cors_header(obj):

    approved_hosts = [
        'http://localhost:8080',
        'https://www.stackbot.com',
        'https://stackbot.com',
        'https://devinci-stackbot.appspot.com'
    ]

    # No need for CORS headers if there wasn't a referrer.
    if obj.request.referer is None:
        return

    url = urlparse(obj.request.referer)
    host = url.scheme + "://" + url.hostname
    if url.port:
        host += ":" + str(url.port)
    if host in approved_hosts:
        obj.response.headers['Access-Control-Allow-Origin'] = host
    obj.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    obj.response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    obj.response.headers['Access-Control-Allow-Credentials'] = 'true'


# Create the global pubkey object so that other code can use it.
pubkey = PublicKey()
