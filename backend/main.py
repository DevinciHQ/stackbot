import os

from flask import request

from shared import app
from shared import security


# Load all the handlers from ./handlers.__init___
# noinspection PyUnresolvedReferences
import handlers

app.debug = True
app.secret_key = 'development'

""" ------------- MAIN ------------------ """

server = str(os.getenv('SERVER_SOFTWARE', ''))
# logging.info("Running using server: ", env)
# Set a flag for what environment we're in.
if server.startswith('Google App Engine/'):
    # Running on Google AppEngine
    env = 'production'
else:
    # Running locally using dev_appserver.py
    env = 'local'


@app.after_request
def after_request(response):
    """ This handles CORS requests for all requests (including OPTIONS).  """
    response = security.set_cors_header(request, response)
    return response

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.

