"""This module defines the routes for github authentication process"""
from werkzeug import security

from shared.oauth import OauthHandler, app, request

from shared.settings import Settings

# TODO: We should define our settings ahead of time so that we avoid typos
# (learn from Drupal's mistakes).
# Settings.define('github_consumer_key')
# Settings.define('github_consumer_secret')

GITHUB_CONFIG = {
    # TODO: These settings don't trigger an issue on startup, only when a request is made.
    'consumer_key': Settings.get('github_consumer_key'),
    'consumer_secret': Settings.get('github_consumer_secret'),
    'request_token_params': {'scope': 'user:email', 'state': lambda: security.gen_salt(10)},
    'base_url': 'https://api.github.com/',
    'request_token_url': None,
    'access_token_method': 'POST',
    'access_token_url': 'https://github.com/login/oauth/access_token',
    'authorize_url': 'https://github.com/login/oauth/authorize'
}

GITHUB = OauthHandler('github', GITHUB_CONFIG)


@app.route('/auth/github')
def get():
    """Route for get."""
    return GITHUB.get()


@app.route('/auth/github/add')
def add():
    """Route for add"""
    return GITHUB.add()


@app.route('/auth/github/delete')
def delete():
    """Route for delete"""
    return GITHUB.delete()


@app.route('/auth/github/authorized_callback')
def authorized():
    """Route for authorize"""
    return GITHUB.authorized()


@GITHUB.oauth_app.tokengetter
def token_getter():
    """Get the credentials from the user token"""
    user = GITHUB.authenticate_user_or_abort(request)
    return GITHUB.get_credential(user)
