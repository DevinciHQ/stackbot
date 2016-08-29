import webapp2
import json
import security

# For use when dealing with the datastore.
from google.appengine.ext import ndb

class ReportHandler(webapp2.RequestHandler):

    def options(self):
        # Set CORS headers for non-GET requests (json data POSTS)
        security.set_cors_header(self)

    def get(self):
        # Set CORS headers for GET requests
        security.set_cors_header(self)

        payload = security.verify_request(self.request)
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
