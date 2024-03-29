"""Add code for dealing with security in the backend"""
import time
import json
import logging
import sys
from urlparse import urlparse

from google.appengine.api import urlfetch
from flask import session
from models.user import User
import jwt
from jwt import ExpiredSignatureError
# These items are needed to use the RS256 Algorithm.
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm
jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))


class ValidationError(Exception):
    """Do nothing with the Validation Error"""
    pass


class AuthenticationError(Exception):
    """Do nothing with the Authentication Error"""
    pass

class PublicKey(object):
    """Define public key caches the keys and makes a request for new keys only if
    the keys are expired"""
    # This is called only the first time that the class is called.
    # It initializes the default values.
    def __init__(self):
        """Initialize the fields required by the key"""
        self._expires = None
        self._keys = {}
        self.rfc_1123_format = "%a, %d %b %Y %H:%M:%S GMT"
        self._url = 'https://www.googleapis.com/robot/v1/metadata/x509/' \
                    'securetoken@system.gserviceaccount.com'

    # This is called everytime the class is called.
    def __call__(self, kid):
        """Get the actual keys from firebase"""
        return self.get_public_cert(kid)

    # Grabs the google certs from the cache or refreshes if they're missing or expired.
    def get_certs(self):
        """Return the keys if they are not expired."""
        now = time.gmtime()
        if self._expires is None or self._expires <= now:
            self.refresh()

        return self._keys

    # Updates the cache of public google certs
    def refresh(self):
        """Fetch the keys from firebase if they are expired"""
        res = urlfetch.Fetch(self._url)
        expires = res.headers.data['expires']
        self._expires = time.strptime(expires, self.rfc_1123_format)
        self._keys = json.loads(res.content)

    # Converts a public x509 cert into a public RSA key.
    @staticmethod
    def conv_509_to_rsa(cert):
        """Convert the x509 cert obtained into a public RSA key."""
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
        """Get the public certs from firebase"""
        keys = self.get_certs()
        if kid not in keys.keys():
            raise Exception("kid '%s' not found in accepted public keys" % kid)

        cert = keys[kid]
        pkey = self.conv_509_to_rsa(cert)
        return pkey.publickey().exportKey()


# Takes a request and returns the payload of the Authorization JWT token,
# including verifying it against google's public keys.
def verify_jwt_token(raw_token):
    """Verify the jwt token using the key obtained from firebase and return
    the decoded token"""

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
        raise ValidationError("alg jwt header should be RS256, but is " + alg)

    # use the global PUBKEY object to fetch the key that matches the key id.
    # pylint: disable=W0602
    global PUBKEY
    key = PUBKEY(kid)

    # Finally decode the token using the RS256 algorithm,
    # the devinci-stackbot audience, and the google public key.
    verified_decoded_token = jwt.decode(raw_token, key, algorithms=['RS256'],
                                        audience='devinci-stackbot')

    if not verified_decoded_token.get('sub'):
        raise ValidationError("sub (aka user_id) is missing from token payload.")

    return verified_decoded_token


# Return the object after setting the CORS header.
def set_cors_header(req, res):
    """Set the CORS header for the approved hosts"""

    approved_hosts = [
        'http://localhost:8080',
        'https://www.stackbot.com',
        'https://stackbot.com',
        'https://devinci-stackbot.appspot.com'
    ]

    # No need for CORS headers if there wasn't a referrer.
    if req.referrer is None:
        return res

    url = urlparse(req.referrer)
    host = url.scheme + "://" + url.hostname
    if url.port:
        host += ":" + str(url.port)
    if url.hostname == 'localhost' or host in approved_hosts:
        res.headers['Access-Control-Allow-Origin'] = host

    res.headers['Access-Control-Allow-Headers'] = 'Origin,' \
                                                       ' X-Requested-With,' \
                                                       ' Content-Type, ' \
                                                       'Accept, ' \
                                                       'Authorization'
    res.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    res.headers['Access-Control-Allow-Credentials'] = 'true'
    return res

def verify_jwt_request(req):
    """Authenticate the JWT token and get the token."""
    # Make sure we actually have an Authorization header.
    auth_header = req.headers.get('Authorization', False)
    if not auth_header:
        raise ValidationError("Authorization header is missing.")
    # Pull out the token from the Authorization header.
    parts = auth_header.split(" ")
    if parts[0] != 'Bearer':
        raise ValidationError("Authorization header is not of type 'Bearer'.")
    if not parts[1] or len(parts[1]) <= 0:
        raise ValidationError("Authorization header is missing token.")
    raw_token = parts[1]

    return verify_jwt_token(raw_token)

def get_user_id_from_token(token):
    return token.get('sub', None)

def authenticate_user(req):
    """
    Get the user from the JWT token. If not found there, check the session cookie
    to see if it is set there. Raise an error if it is not found at any of those places.
    """
    # I had an idea with the code below to allow a function to pass an exception handler..
    # Now thinking it's unnecessary, but it would be nice to have something automatically
    # send the abort codes for us.
    #
    # except_fn = None
    # if except_fn is not None and not callable(except_fn):
    #     raise Exception("except_fn must be a function that will do exception handling.")
    # Plan A: Get their user_id from a jwt token.
    verified_token = None
    try:
        verified_token = verify_jwt_request(req)
        user_id = get_user_id_from_token(verified_token)
    except (ValidationError, ExpiredSignatureError):
        # Keep track of the original error.
        err_type, err_value, err_tb = sys.exc_info()
        # Plan B: Get their user_id from the session.
        user_id = get_auth_session_cookie()
        if not user_id:
            # Post the original error since session credential usage is rare,
            # so far only used in the OAuth flows.
            raise err_type(err_value)

    user = User.get_by_user_id(user_id)
    if user is None:
        if not verified_token:
            raise AuthenticationError("User cannot be created without a verified token.")
        else:
            # TODO: Don't just create the user on the fly.. maybe take a param to add a user?
            #raise AuthenticationError("User with user_id: %s not found." % user_id)
            user = User(user_id=user_id,email=verified_token.get('email'), username=verified_token.get('name')).put().get()
    return user


def set_auth_session_cookie(req):
    """Set the user session cookie"""
    user_id = get_user_id_from_token(verify_jwt_request(req))
    session['user_id'] = user_id


def get_auth_session_cookie():
    """Get the user session cookie"""
    user_id = session.get('user_id', None)
    return user_id


def delete_auth_session_cookie():
    """Delete the user session cookie"""
    session.pop('user_id', None)


def get_referrer_insecure(req):
    """check for an insecure referrer"""
    if not req.referrer:
        return None
    url = urlparse(req.referrer)
    if url and url.scheme and url.netloc:
        return "%s://%s" % (url.scheme, url.netloc)
    else:
        logging.warn("Got a malformed referrer.")


def is_request_with_auth(req):
    """Check if the request has an auth header."""
    auth_header = req.headers.get('Authorization', False)
    if not auth_header:
        return False
    return True
# Create the global pubkey object so that other code can use it.
PUBKEY = PublicKey()
