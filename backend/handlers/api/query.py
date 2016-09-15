"""This module handles the query route /api/q"""
import datetime
import logging
import urllib
import json
from google.appengine.api import urlfetch

from flask import request, abort, jsonify
from shared import app
from shared import security, get_geo_data, ApiResponse
from models.query import Query
from user_agents import parse as parseUA


@app.route('/api/q', methods=['GET'])
def query_handler():
    """ Handle the incoming request and create a Query entity if a query string was passed. """

    # Make sure the length of the query string is at least 1 char.
    search_string = request.args.get('q', '')

    tags = get_tags(search_string)
    query_string = get_query(search_string)

    # Return 400 bad request error if the search_string contains only
    # hashtags and no actual search query.
    if len(query_string) == 0:
        abort(400)
    user = None

    # If we get an unauthenticated query request, just go ahead and redirect them to google for now
    # without recording it in the database. (We may change this behavior soon)
    if not security.is_request_with_auth(request):
        data = get_bing_data(query_string)
        if 'webPages' in data:
            data = data['webPages']['value']
        else:
            return jsonify(ApiResponse())
        payload = []
        for i in data:
            data = {
                'name': i['name'],
                'url': i['url'],
                'displayUrl': i['displayUrl']
            }
            payload.append(data)
        return jsonify(ApiResponse(payload))
    # The request WAS trying to authenticate, so let's try to get the authenticated user.
    try:
        user = security.authenticate_user(request)
    except security.ValidationError as err:
        logging.debug(err)
        abort(401)

    # Get the user-agent header from the request.
    user_agent = parseUA(request.headers['User-Agent'])
    geo = get_geo_data(request)

    source = request.args.get('source')
    if source not in ['site-search', 'omnibox']:
        abort(400) # The source field should be required.

    # Create a new Query entity from the q value.
    # TODO: Add the other values that we want from the request headers.
    query = Query(
        query=query_string,
        os=str(user_agent.os.family) + " Version: " + str(user_agent.os.version_string),
        browser=str(user_agent.browser.family),
        timestamp=datetime.datetime.utcnow().isoformat(),
        country=geo['country'],
        city=geo['city'],
        city_lat_long=geo['city_lat_long'],
        ip=request.remote_addr,
        uid=user.user_id,
        source=source,
        user=user.key,
        tags=tags
    )
    # Save to the datatore.
    query.put()
    logging.debug('query: %s', str(query))
    data = get_bing_data(query_string)
    if 'webPages' in data:
        data = data['webPages']['value']
    else:
        return jsonify(ApiResponse())
    payload = []
    for i in data:
        data = {
            'name': i['name'],
            'url': i['url'],
            'displayUrl': i['displayUrl']
        }
        payload.append(data)
    return jsonify(ApiResponse(payload))


def get_tags(search_string):
    tags = []
    for i in search_string.split():
        # The len(i) condition checks for empty hashtags and doesn't add them
        # to the tags list.
        if i.startswith("#") and len(i) > 1:
            # Remove the '#' from the hashtag and append it to tags list.
            tags.append(i[1:])
        # The else condition ignores the hashtags within the actual query and
        # considers them a part of query. Eg: "#test is #good" will add just
        # the 'test' to the tags. 'good' will be a part of the search query.
        else:
            return tags
    # To handle the case where we only have hashtags and not actual search query.
    # However, the user should never be able to search with hashtags only.
    return tags


def get_query(search_string):
    search_query = []
    cursor = True
    for i in search_string.split():
        # The cursor condition keeps track of the tags which are at the beginning of
        # the search string. Other tags should be treated as a part of the search
        # query. The len(i) condition checks for empty hashtags and includes it as a
        # part of query.
        if i.startswith("#") and cursor and len(i) > 1:
            pass
        else:
            search_query.append(i)
            cursor = False
    return " ".join(search_query)


def create_google_redirect(search_string):
    """convert a string into a google url that will show search results."""
    escaped_q = urllib.urlencode({'q': search_string})
    redirect = 'https://google.com/#' + escaped_q
    return redirect


def get_bing_data(query_string):
    """ Get the search result using Bing's api. """
    url = 'https://api.cognitive.microsoft.com/bing/v5.0/search?'+urllib.urlencode({'q':query_string})

    try:
        headers = {'Ocp-Apim-Subscription-Key': 'd4ded470d517472da9b40836ab319538'}
        result = urlfetch.fetch(
            url=url,
            method=urlfetch.GET,
            headers=headers)
    except urlfetch.Error:
        logging.exception('Caught exception fetching url')
    return json.loads(result.content)
