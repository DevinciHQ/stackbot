import time
from google.appengine.api import urlfetch
import jwt
from jwt import ExpiredSignatureError
from urlparse import urlparse
import json
import logging
from flask import abort, session
from models.user import User
import sys

# These items are needed to use the RS256 Algorithm.
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm
jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))


class ValidationError(Exception):
    pass


class AuthenticationError(Exception):
    pass

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
        tbs_certificate = DerSequence()
        tbs_certificate.decode(cert[0])
        subject_public_key_info = tbs_certificate[6]

        # Initialize RSA key
        rsa_key = RSA.importKey(subject_public_key_info)
        return rsa_key

    # Pulls the public cert from the list of certs provided by google.
    def get_public_cert(self, kid):
        keys = self.get_certs()
        if kid not in keys.keys():
            raise Exception("kid not found in accepted public keys")

        cert = keys[kid]
        pkey = self.conv_509_to_RSA(cert)
        return pkey.publickey().exportKey()


# Takes a request and returns the payload of the Authorization JWT token,
# including verifying it against google's public keys.
def verify_jwt_token(request):

    # Make sure we actually have an Authorization header.
    auth_header = request.headers.get('Authorization', False)
    if not auth_header:
        raise ValidationError("Authorization header is missing.")

    # Pull out the token from the Authorization header.
    parts = auth_header.split(" ")
    if parts[0] != 'Bearer':
        raise ValidationError("Authorization header is not of type 'Bearer'.")
    if not parts[1] or len(parts[1]) <= 0:
        raise ValidationError("Authorization header is missing token.")
    raw_token = parts[1]

    # Decode the token without verification so that we can get the key id.
    jwt_header = jwt.get_unverified_header(raw_token)
    kid = jwt_header.get('kid', None)
    if not kid:
        raise ValidationError("kid jwt header is missing.")

    # Check the the algorithm matches.
    alg = jwt_header.get('alg', None)
    if not alg:
        raise ValidationError("alg jwt header is missing.")
    if alg != 'RS256':
        raise ValidationError("alg jwt header should be RS256, but is not.")

    # use the global pubkey object to fetch the key that matches the key id.
    global pubkey
    key = pubkey(kid)

    # Finally decode the token using the RS256 algorithm, the devinci-stackbot audience, and the google public key.
    verified_decoded_token = jwt.decode(raw_token, key, algorithms=['RS256'], audience='devinci-stackbot')

    if not verified_decoded_token.get('sub'):
        raise ValidationError("sub (aka user_id) is missing from token payload.")

    return verified_decoded_token


# Return the object after setting the CORS header.
def set_cors_header(request, response):

    approved_hosts = [
        'http://localhost:8080',
        'https://www.stackbot.com',
        'https://stackbot.com',
        'https://devinci-stackbot.appspot.com'
    ]

    # No need for CORS headers if there wasn't a referrer.
    if request.referrer is None:
        return response

    url = urlparse(request.referrer)
    host = url.scheme + "://" + url.hostname
    if url.port:
        host += ":" + str(url.port)
    if url.hostname == 'localhost' or host in approved_hosts:
        response.headers['Access-Control-Allow-Origin'] = host

    response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


def _jwt_authenticate(request):
    user_id = verify_jwt_token(request).get('sub')
    return user_id


def authenticate_user(request):

    # I had an idea with the code below to allow a function to pass an exception handler..
    # Now thinking it's unnecessary, but it would be nice to have something automatically send the abort codes for us.
    #
    # except_fn = None
    # if except_fn is not None and not callable(except_fn):
    #     raise Exception("except_fn must be a function that will do exception handling.")
    # Plan A: Get their user_id from a jwt token.
    try:
        user_id = _jwt_authenticate(request)
    except (ValidationError, ExpiredSignatureError) as err:
        # Keep track of the original error.
        err_type, err_value, err_tb = sys.exc_info()
        # Plan B: Get their user_id from the session.
        user_id = session.get('user_id', None)
        if not user_id:
            # Post the original error since session credential usage is rare,
            # so far only used in the OAuth flows.
            raise err_type(err_value, err_tb)

    user = User.get_by_user_id(user_id)
    if user is None:
        raise AuthenticationError("User with user_id: %s not found." % user_id)

    return user


def set_auth_session_cookie():
    user_id = _jwt_authenticate(request)
    session['user_id'] = user_id


def get_auth_session_cookie():
    return session.get('user_id', None)


def delete_auth_session_cookie():
    session.pop('user_id', None)


def get_referrer_insecure(request):
    if not request.referrer:
        return None
    url = urlparse(request.referrer)
    if url.get('scheme') and url.get('netloc'):
        return "%s://%s" % (url.scheme, url.netloc)
    else:
        logging.warn("Got a malformed referrer.")


# Create the global pubkey object so that other code can use it.
pubkey = PublicKey()
