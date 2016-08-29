import json
import logging

from flask import request, abort
from shared import app
from shared import security

# For use when dealing with the datastore.
from google.appengine.ext import ndb


@app.route('/api/report', methods=['GET'])
def report_handler():

    user_id = None
    try:
        user_id = security.verify_jwt_token(request).get('sub')
    except security.ValidationError as err:
        # IF the user isn't logged in, then throw a 403 error.
        logging.error(err)
        abort(403)

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
    return json.dumps(output)
