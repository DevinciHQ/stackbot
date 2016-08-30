import logging
from urlparse import urlparse

from flask import url_for, session, request, jsonify, abort
from flask_oauthlib.client import OAuth, OAuthRemoteApp
from shared import ApiResponse
from models.credential import Credential
from shared import app
from shared.security import ValidationError, AuthenticationError
import shared.security as sec
from models.user import User

oauth = OAuth(app)


class OauthHandler:
    """A generic Oauth handler class that should work for most oauth providers and our frontend oauth code."""


    def __init__(self, auth_type, config):
        """Constructor that creates the OauthHandler.

        Args:
            auth_type (string): The type of handler this is.
            config (dict): The configuration for an OAuthRemoteApp
        """
        self.cred_type = auth_type
        self.config = config
        self.oauth_app = oauth.remote_app(type, **config)  # type: OAuthRemoteApp

    """ HELPER FUNCTIONS FOLLOW """

    def authenticate_user_or_abort(self, req):
        """Verify a user and return a user_id or abort the request with a 401 error.

        Args:
            req (Request): a flask request.

        Return: (User)
            The currently logged in user.

        """
        try:
            return sec.authenticate_user(req)
        except (ValidationError, AuthenticationError) as err:
            logging.error(err)
            abort(401)

    def check_valid_referrers(self, host_to_check):
        """Return the verified referrer or None if not verified.

        Args:
            host_to_check (str): a full host url to check for.

        Returns:
            host if in approved referrers, else None.

        """
        valid_referrers = [
            'http://localhost:8080',
            'http://localhost:8082',
            'https://www.stackbot.com',
            'https://stackbot.com',
        ]
        return host_to_check if host_to_check in valid_referrers else None

    def get_credential(self, user):
        """Get a user's credential for this handler's OAuth provider (i.e. github)

        Args:
            user (User): The user to get a credential of this type for.

        Returns:
            Credential: The user's credential.

        """
        # Only return a single credential of this type since for now, we're only allowing
        # one credential per type per User to keep things simple.
        creds = user.credentials(self.cred_type)
        return creds[0] if creds else None

    def delete_credential(self, user):
        """ Delete a user's credential if one exists.

        Args:
            user (User): the user to delete a token for.
        """
        credentials = user.credentials(self.cred_type)
        if credentials:
            credentials[0].key.delete()

    def update_credential(self, user, access_token):
        """ Create or update an existing user's credential of this type.

        Args:
            access_token (str): The OAuth access_token to update this Credential with.
            user (User): The user who should have the Credential updated.

        Returns (Credential):
            The key of the Credential.
        """
        # First check if there is an existing credential.
        credential = self.get_credential(user)  # type: Credential
        if credential:
            credential.token = access_token
            return credential.put()
        # Otherwise, save a new credential.
        credential = Credential(user=user.key, type=self.cred_type, token=access_token)
        return credential.put()

    """" HANDLER ENDPOINT FUNCTIONS FOLLOW """

    def get(self):
        """API call to get the session cookie and get the URL to redirect the user to.

        Notes:
            Generates a new session cookie that contains the user_id if the user XHR request uses 'withCredentials = true'.
            See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials

        Example flask route:
            /auth/<TYPE>

        Todos:
            * Since this is really more of an API call, should it even be in this class instead of part of the integrations api?

        Returns:
            ApiResponse with redirect_for_auth set to the full path a user should be redirected to.
        """
        user = self.authenticate_user_or_abort(request)

        # Check for an existing credential that we can pass back to the caller.
        credential = self.get_credential(user)
        existing_credential = None
        if credential:
            existing_credential = {
                'id': credential.key.id(),
                'type': credential.type
            }

        # Set an auth session cookie for the user so they can proceed through the oauth flow
        # and we can keep track of which user the credential belongs to without a JWT token.
        # TODO: Can we move this to self.add() instead?
        sec.set_auth_session_cookie()

        # Set the referrer in the session cookie as well so that we can check (insecurely) where the user was originally redirected from.
        session['referrer_host'] = sec.get_referrer_insecure(request)

        return jsonify(ApiResponse(payload={
            "redirect_for_auth": url_for('add', _external=True),
            "existing_credential": existing_credential,
        }))

    def add(self):
        """When an authenticated User visits this page, it triggers the OAuth flow via redirects.

        Notes:
            A User session cookie can be used to authenticate user.

        Example flask route:
            /auth/<TYPE>/add

        Returns:
            A Response with a 301 redirect created by flask-oauth.
        """
        # User session cookie should be set, so we don't need to keep track of the user, but fail if not.
        self.authenticate_user_or_abort(request)
        return self.oauth_app.authorize(callback=url_for('authorized', _external=True))

    def delete(self):
        """When an authenticated User visits this page, it deletes their OAuth token of this type if it exists.

        Notes:
           A User session cookie can be used to authenticate user.

        Example flask route:
           /auth/<TYPE>/delete

        Returns:
           An empty ApiResponse.
        """
        # TODO: We should remove this and instead use the integrations api.
        user = self.authenticate_user_or_abort(request)
        self.delete_credential(user)
        return jsonify(ApiResponse())

    def authorized(self):
        """Creates a new Token of this type if the Oauth flow was successful.

        Notes:
           A User session cookie can be used to authenticate user.

           This page is where users end up who have completed the OAuth flow.

           Since this page will often show up inside of a popup, we need to finish the process by cleaning up the popup
           from the frontend code, which is what the popup_closer helps us do. The frontend can send messages to this page
           via message events, and it will respond back with a success message so that parent can close it. We're not
           currently handling a scenario where something goes wrong and there is some sort of error.

           We currently have a potential security issue where we rely on the insecure Referrer header when listening for
           incoming messages in the popup. Not thinking it's a big deal because that session cookie should only be set
           when the frontend makes an authorized request to the backend. In theory, an authenticated user could fake the
           request header of the initial request, but it's not clear to what end since it's their browser. It's also
           mitigated by the fact that we check the referrer against a whitelist before printing it in the popup_closer.

           See check_valid_referrers()

        Example flask route:
           /auth/<TYPE>/delete

        Returns:
           A popup_closer Response.

        @app.route('/auth/<TYPE>/delete:

        Returns: popup_closer response

        """
        user = self.authenticate_user_or_abort(request)
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

        popup_closer = """
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

        # Remove the entire session cookie. Shouldn't matter much,
        # but no sense keeping the session around longer than necessary
        session.clear()

        return popup_closer
