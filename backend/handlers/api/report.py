"""This module handles the report route /api/report"""
import logging

from flask import request, abort, jsonify
from shared import app, ApiResponse, security
from google.appengine.datastore.datastore_query import Cursor

# For use when dealing with the datastore.
from google.appengine.ext import ndb


@app.route('/api/report', methods=['GET'])
def report_handler():
    """ Returns a report with all of the most recent queries up to some limit
     in reverse chronological order. """

    user = None
    try:
        user = security.authenticate_user(request)
    except security.ValidationError as err:
        # IF the user isn't logged in, then throw a 401 error.
        logging.debug(err)
        abort(401)

    # https://cloud.google.com/appengine/docs/python/ndb/queries#properties_by_string
    # https://cloud.google.com/appengine/docs/python/ndb/queries#cursors
    # We are fetching all the columns instead of the specific columns because of a bug
    # (we believe it's a bug) where the result contains duplicate records for each of the
    # tags in the tags list. This issue(or a functionality) which is caused by the 'repeated'
    # property of a column is not documented on the GAE's site.
    # We use the cursor feature of GAE to take note of the last data fetched from the database.
    # See: https://cloud.google.com/appengine/docs/python/ndb/queries#cursors
    cursor = Cursor(urlsafe=request.args.get('cursor', None))
    result, next_cursor, more = ndb.gql("SELECT * FROM Query WHERE uid = :1 ORDER BY "
                     "timestamp DESC", user.user_id).fetch_page(5, start_cursor=cursor)

    data = []
    for query in result:
        # This is annoying.. maybe we should use another word instead of query?
        # We couldn't use 'query.query' like we can for other values because that's a reserved word?
        if not query.tags:
            tags = []
        if not isinstance(query.tags, list):
            abort(500)

        query_out = {
            'query': query.query,
            'timestamp': query.timestamp,
            'tags': query.tags
        }
        data.append(query_out)
    # Append the cursor to the data if it exists.
    if next_cursor is not None:
        next_cursor = {
            'cursor': next_cursor.urlsafe()
        }
        data.append(next_cursor)
    return jsonify(ApiResponse(data))
