import logging
from urlparse import urlparse

from flask import url_for, session, request, jsonify, abort
from flask_oauthlib.client import OAuth, OAuthRemoteApp
from shared import ApiResponse
from models.credential import Credential
from shared import app
from shared.security import authenticate_user, ValidationError, AuthenticationError

# For use when dealing with the datastore.


oauth = OAuth(app)


class OauthHandler:

    def __init__(self, type, config):
        self.cred_type = type
        self.config = config
        self.oauth_app = oauth.remote_app(type, **config)  # type: OAuthRemoteApp

    def authenticate_user(self, req):
        try:
            return authenticate_user(req)
        except (ValidationError, AuthenticationError) as err:
            logging.error(err)
            abort(403)

    def check_valid_referrers(self, host_to_check):
        valid_referrers = [
            'http://localhost:8080',
            'http://localhost:8082',
            'https://www.stackbot.com',
            'https://stackbot.com',
        ]
        return host_to_check if host_to_check in valid_referrers else None

    def get_credential(self, user):
        # Only return a single credential of this type since for now, we're only allowing
        # one credential per type per User to keep things simple.
        creds = user.credentials(self.cred_type)
        return creds[0] if creds else None

    def delete_credential(self, user):
        creds = user.credentials(self.cred_type)
        if creds:
            creds[0].key.delete()

    def update_credential(self, user, access_token):

        # First check if there is an existing credential.
        credential = self.get_credential(user)  # type: Credential
        if credential:
            credential.token = access_token
            return credential.put()
        # Otherwise, save a new credential.
        credential = Credential(user=user.key, type=self.cred_type, token=access_token)
        return credential.put()

    def get(self):
        api_return = ApiResponse(payload={"redirect_for_auth": url_for('add', _external=True)})
        user = self.authenticate_user(request)
        credential = self.get_credential(user)
        if not credential:
            api_return.success = False
        # Set a session cookie for the user so they can proceed through the oauth flow
        # and we can keep track of which user the credential belongs to.
        # TODO: Can we move this to self.add() instead?
        session['user_id'] = user.user_id
        if request.referrer:
            url = urlparse(request.referrer)
            session['referrer_host'] = "%s://%s" % (url.scheme, url.netloc)

        return jsonify(api_return)

    def add(self):
        user = self.authenticate_user(request)
        return self.oauth_app.authorize(callback=url_for('authorized', _external=True))

    def delete(self):
        user = self.authenticate_user(request)
        self.delete_credential(user)
        return jsonify(ApiResponse(success=True))

    def authorized(self):
        user = self.authenticate_user(request)
        resp = self.oauth_app.authorized_response()
        user_id = session.get('user_id')
        # If they don't have a user_id set, then something with the flow was messed up.
        # Give a 403 error back for now.
        if user_id is None:
            abort(403)
        if resp is None:
            return 'Access denied: reason=%s error=%s' % (
                request.args['error'],
                request.args['error_description']
            )

        self.update_credential(user, resp['access_token'])

        popup_closer =  """
        <html>
            <script>
            // Called sometime after postMessage is called
            function receiveMessage(event)
            {
              // Do we trust the sender of this message?
              if (event.origin !== "%s")
                return;

              // event.source is window.opener
              // event.data is "hello there!"

              // Assuming you've verified the origin of the received message (which
              // you must do in any case), a convenient idiom for replying to a
              // message is to call postMessage on event.source and provide
              // event.origin as the targetOrigin.
              event.source.postMessage("success",
                                       event.origin);
            }

            window.addEventListener("message", receiveMessage, false);

            </script>
        </html>""" % self.check_valid_referrers(session.get('referrer_host'))

        # Remove the session cookie. Shouldn't matter much,
        # but no sense keeping the session around longer than necessary
        session.clear()

        return popup_closer









