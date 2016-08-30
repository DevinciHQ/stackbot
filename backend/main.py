"""Expose all the handlers in the main file and determine the environment where the app
is running."""
import os

from flask import request

# Load all the handlers
# Message codes for pylint, http://pylint-messages.wikidot.com/all-codes
# pylint: disable=W0611
# noinspection PyUnresolvedReferences
from handlers.api import query, report, user, integration
# noinspection PyUnresolvedReferences
from handlers.auth import github

from shared import APP
from shared import security
from shared.settings import Settings

APP.debug = True
APP.secret_key = 'development'

""" ------------- MAIN ------------------ """

Settings.get('github_consumer_key')

SERVER = str(os.getenv('SERVER_SOFTWARE', ''))
# logging.info("Running using server: ", env)
# Set a flag for what environment we're in.
if SERVER.startswith('Google App Engine/'):
    # Running on Google AppEngine
    ENV = 'production'
else:
    # Running locally using dev_appserver.py
    ENV = 'local'


@APP.after_request
def after_request(response):
    """ This handles CORS requests for all requests (including OPTIONS).  """
    response = security.set_cors_header(request, response)
    return response

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.
