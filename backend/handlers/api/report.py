"""This module handles the report route /api/report"""
import logging

from flask import request, abort, jsonify
from shared import app, ApiResponse, security

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
    result = ndb.gql("SELECT * FROM Query WHERE uid = :1 ORDER BY "
                     "timestamp DESC LIMIT 100", user.user_id)
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

    return jsonify(ApiResponse(data))
