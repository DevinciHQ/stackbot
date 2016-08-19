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

# For use when dealing with the datastore.
from google.appengine.ext import ndb
from user_agents import parse as parseUA
import logging, os


# Set a flag for what environment we're in.
if os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/'):
    # Running on Google AppEngine
    env = 'production'
else:
    # Running locally using dev_appserver.py
    env = 'local'


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
def get_CORS_Header(obj):
    obj.response.headers['Access-Control-Allow-Origin'] = '*'
    obj.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
    obj.response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return obj

# This handles the incoming request and creates a Query entity if a query string
# was passed.
class QueryHandler(webapp2.RequestHandler):

    def options(self):
            # Set CORS headers for non-GET requests (json data POSTS)
            get_CORS_Header(self)


    def get(self):
        q = self.request.get('q')
        # Make sure the length of the query string is at least 1 char.
        if len(q) > 0:
            # Set CORS headers for GET requests
            get_CORS_Header(self)

            # Get the user-agent header from the request.
            userAgent = parseUA(self.request.headers['User-Agent'])
            if self.request.headers['User-Agent']:
                pass
            geo = get_geo_data(self.request)
            logging.debug('geo', geo)

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
                uid=self.request.get('uid', None)
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
        get_CORS_Header(self)

    def get(self):
        # Set CORS headers for GET requests
        get_CORS_Header(self)

        uid = self.request.get('uid', "")
        logging.debug("This is uid:" + uid)
        #https://cloud.google.com/appengine/docs/python/ndb/queries#properties_by_string
        #https://cloud.google.com/appengine/docs/python/ndb/queries#cursors
        result = ndb.gql("SELECT query, timestamp FROM Query WHERE uid = :1 ORDER BY timestamp DESC LIMIT 20", uid)
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


class TokenHandler(webapp2.RequestHandler):
    def get(self):
        print jwt.decode(self.request.get('token'), 'secret', algorithms=['HS256'])


# Actually run the webserver and accept requests.
app = webapp2.WSGIApplication([
    ('/api/q',QueryHandler),
    ('/api/report', ReportHandler),
    ('/api/token', TokenHandler)
], debug=True)


