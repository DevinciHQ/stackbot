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

# For use when dealing with the datastore.
from google.appengine.ext import ndb
from user_agents import parse as parseUA
import logging

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


# This handles the incoming request and creates a Query entity if a query string
# was passed.
class QueryHandler(webapp2.RequestHandler):
    def get(self):
        q = self.request.get('q')
        # Make sure the length of the query string is at least 1 char.
        if len(q) > 0:

            # Get the user-agent header from the request.
            userAgent = parseUA(self.request.headers['User-Agent'])
            if self.request.headers['User-Agent']:
                pass
            geo = get_geo_data(self.request)
            logging.debug('geo', geo)

            #Get the UID cookie if it is set.
            uid = ""
            if(self.request.cookies.get('uid') != ""):
                uid = self.request.cookies.get('uid')

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
                uid=uid
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



        # Actually run the webserver and accept requests.
app = webapp2.WSGIApplication([
    ('/api/q', QueryHandler),
], debug=True)

