import webapp2
import datetime
import json
import urllib
import security
import logging
from user_agents import parse as parseUA

from models.query import Query


# This handles the incoming request and creates a Query entity if a query string
# was passed.
class QueryHandler(webapp2.RequestHandler):

    def options(self):
        # Set CORS headers for non-GET requests (json data POSTS)
        security.set_cors_header(self)

    def get(self):
        # Set CORS headers for GET requests
        security.set_cors_header(self)
        # Make sure the length of the query string is at least 1 char.
        q = self.request.get('q')
        if len(q) > 0:
            payload = security.verify_request(self.request)
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
                uid=user_id,
                source=self.request.get('source', None)
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

# Not that geoip2 (from maximind) doesn't work on GAE because there is a C lib in there apparently.
# We can use Appengine's added headers to do that work though thankfully.
def get_geo_data(request):
    geo = dict()
    geo['region'] = request.headers.get("X-AppEngine-Region", "unknown")
    geo['city'] = request.headers.get("X-AppEngine-City", "unknown")
    geo['country'] = request.headers.get("X-AppEngine-Country", "unknown")
    geo['city_lat_long'] = request.headers.get("X-AppEngine-CityLatLong", "unknown")
    return geo
