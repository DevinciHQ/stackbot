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

# For use when dealing with the datastore.
from google.appengine.ext import ndb

# A simple Datastore Entity that takes any values (good for development)
# See https://cloud.google.com/appengine/docs/python/ndb/creating-entity-models
class Query(ndb.Expando):
    pass

# This handles the incoming request and creates a Query entity if a query string
# was passed.
class QueryHandler(webapp2.RequestHandler):
  def get(self):
    q = self.request.get('q')
    # Make sure the length of the query string is at least 1 char.
    if len(q) > 0:
      # Create a new Query entity from the q value.
      # TODO: Add the other values that we want from the request headers.
      query = Query(query=q)
      # Save to the datatore.
      query.put()

      # Output some debug messages for now.
      # TODO: Redirect to google.
      self.response.write('Saved')
      self.response.write(q)

    # Output for when we first land on the page (or when no query was entered)
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.write('Yey!' + q)


# Actually run the webserver and accept requests.
app = webapp2.WSGIApplication([
    ('/', QueryHandler),
], debug=True)


