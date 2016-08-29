import datetime
import json
import logging
import urllib

from flask import request, abort
from shared import app
from models.query import Query
from shared import security
from user_agents import parse as parseUA


# This handles the incoming request and creates a Query entity if a query string
# was passed.
@app.route('/api/q', methods=['GET'])
def query_handler():
    # Set CORS headers for GET requests
    # security.set_cors_header(self)
    # Make sure the length of the query string is at least 1 char.
    q = request.args.get('q', '')
    if len(q) <= 0:
        abort(400)

    user_id = None
    try:
        user_id = security.verify_jwt_token(request).get('sub')
    except security.ValidationError as err:
        # IF the user isn't logged in, then throw a 403 error.
        logging.error(err)
        abort(403)

    # Get the user-agent header from the request.
    userAgent = parseUA(request.headers['User-Agent'])
    geo = get_geo_data(request)

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
        ip=request.remote_addr,
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
    # response.headers['Content-Type'] = 'application/json'
    payload = {
        'redirect': redirect
    }
    output = {
        'success': True,
        'payload': payload,
    }
    return json.dumps(output)


# Not that geoip2 (from maximind) doesn't work on GAE because there is a C lib in there apparently.
# We can use Appengine's added headers to do that work though thankfully.
def get_geo_data(request):
    geo = dict()
    geo['region'] = request.headers.get("X-AppEngine-Region", "unknown")
    geo['city'] = request.headers.get("X-AppEngine-City", "unknown")
    geo['country'] = request.headers.get("X-AppEngine-Country", "unknown")
    geo['city_lat_long'] = request.headers.get("X-AppEngine-CityLatLong", "unknown")
    return geo
