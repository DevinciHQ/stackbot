# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import webapp2
import datetime
import json
import urllib
import jwt
import time
from urlparse import urlparse

# For use when dealing with the datastore.
from google.appengine.ext import ndb
from google.appengine.api import urlfetch
from user_agents import parse as parseUA
import logging, os

# These items are needed to use the RS256 Algorithm.
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm
jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))


# A simple Datastore Entity that takes any values (good for development)
# See https://cloud.google.com/appengine/docs/python/ndb/creating-entity-models
class Query(ndb.Expando):
    pass


# Not that geoip2 (from maximind) doesn't work on GAE because there is a C lib in there apparently.
# We can use Appengine's added headers to do that work though thankfully.
def get_geo_data(request):
    geo = dict()
    geo['region'] = request.headers.get("X-AppEngine-Region", "unknown")
    geo['city'] = request.headers.get("X-AppEngine-City", "unknown")
    geo['country'] = request.headers.get("X-AppEngine-Country", "unknown")
    geo['city_lat_long'] = request.headers.get("X-AppEngine-CityLatLong", "unknown")
    return geo


# Return the object after setting the CORS header.
def set_cors_header(obj):

    approved_hosts = [
        'http://localhost:8080',
        'https://www.stackbot.com',
        'https://stackbot.com',
        'https://devinci-stackbot.appspot.com'
    ]

    # global env
    #if env == 'local':
    #    obj.response.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080'
    print(obj.request.referer)
    referer = obj.request.referer
    url = urlparse(referer)
    host = url.scheme + "://" + url.hostname
    if url.port:
        host += ":" + str(url.port)
    if host in approved_hosts:
        obj.response.headers['Access-Control-Allow-Origin'] = host
    obj.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    obj.response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    obj.response.headers['Access-Control-Allow-Credentials'] = 'true'


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

# This handles the incoming request and creates a Query entity if a query string
# was passed.
class QueryHandler(webapp2.RequestHandler):

    def options(self):
        # Set CORS headers for non-GET requests (json data POSTS)
        set_cors_header(self)

    def get(self):
        # Set CORS headers for GET requests
        set_cors_header(self)
        # Make sure the length of the query string is at least 1 char.
        q = self.request.get('q')
        if len(q) > 0:
            payload = verify_request(self.request)
            user_id = payload.get('sub')
            if not user_id:
                raise Exception("sub is missing from token payload.")

            # Get the user-agent header from the request.
            userAgent = parseUA(self.request.headers['User-Agent'])
            geo = get_geo_data(self.request)

            # Create a new Query entity from the q value.
            # TODO: Add the other values that we want from the request headers.
            query = Query(
                query=q,
                os=str(userAgent.os.family) + " Version: " + str(userAgent.os.version_string),
                browser=str(userAgent.browser.family),
                timestamp=datetime.datetime.utcnow().isoformat(),
                country=geo['country'],
                city=geo['city'],
                city_lat_long=geo['city_lat_long'],
                ip=self.request.remote_addr,
                uid=user_id
            )
            # Save to the datatore.
            query.put()
            # Output some debug messages for now.
            # TODO: Redirect to google.
            logging.info('Saved')
            logging.debug('query: %s', str(q))

            escaped_q = urllib.urlencode({'q': q})
            redirect = 'http://google.com/#' + escaped_q

            # Output for when we first land on the page (or when no query was entered)
            self.response.headers['Content-Type'] = 'application/json'
            payload = {
                'redirect': redirect
            }
            output = {
                'success': True,
                'payload': payload,
            }
            self.response.out.write(json.dumps(output))


class ReportHandler(webapp2.RequestHandler):

    def options(self):
        # Set CORS headers for non-GET requests (json data POSTS)
        set_cors_header(self)

    def get(self):
        # Set CORS headers for GET requests
        set_cors_header(self)

        payload = verify_request(self.request)
        user_id = payload.get('sub')
        if not user_id:
            raise Exception("sub is missing from token payload.")

        # https://cloud.google.com/appengine/docs/python/ndb/queries#properties_by_string
        # https://cloud.google.com/appengine/docs/python/ndb/queries#cursors
        result = ndb.gql("SELECT query, timestamp FROM Query WHERE uid = :1 ORDER BY timestamp DESC LIMIT 20",
                         user_id)
        data = []
        for query in result:
            # This is annoying.. maybe we should use another word instead of query?
            # We couldn't use 'query.query' like we can for other values because that's a reserved word?
            q = query._to_dict()
            data.append(q)

        output = {
            'success': True,
            'payload': data
        }
        self.response.out.write(json.dumps(output))


""" ------------- MAIN ------------------ """

logging.debug('SERVER_SOFTWARE', os.getenv('SERVER_SOFTWARE', ''))
# Set a flag for what environment we're in.
if os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/'):
    # Running on Google AppEngine
    env = 'production'
else:
    # Running locally using dev_appserver.py
    env = 'local'

# Create the global pubkey object so that other code can use it.
pubkey = PublicKey()

# Actually run the webserver and accept requests.
app = webapp2.WSGIApplication([
    ('/api/q', QueryHandler),
    ('/api/report', ReportHandler),
], debug=True)


