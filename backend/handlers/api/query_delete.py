from flask import request
from shared import app
from google.appengine.ext import ndb


@app.route('/api/delete', methods=['DELETE'])
def query_edit_handler():
    """ Edits a query based on the key and edited content passed as a GET parameter. """

    key = request.args.get('key', None)

    key = ndb.Key(urlsafe=key)
    old_query = key.get()
    old_query.key.delete()

