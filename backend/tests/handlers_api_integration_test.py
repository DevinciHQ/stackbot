""" Test the Integration API."""
import unittest
import json
from google.appengine.ext import ndb, testbed
from handlers.api.integration import app
from context import get_fake_jwt_token, remove_fake_certs, set_fake_certs, setup_fake_user, MockRequest
from shared import ApiResponse
from flask import Response
from models.credential import Credential
from models.user import User

class QueryApiTestCase(unittest.TestCase):
    """ Create a test case. """

    def setUp(self):
        """ Setup the test."""
        # First, create an instance of the Testbed class.
        self.testbed = testbed.Testbed()
        # Then activate the testbed, which prepares the service stubs for use.
        self.testbed.activate()
        # Next, declare which service stubs you want to use.
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_memcache_stub()
        self.testbed.init_urlfetch_stub()
        # Clear ndb's in-context cache between tests.
        # This prevents data from leaking between tests.
        # Alternatively, you could disable caching by
        # using ndb.get_context().set_cache_policy(False)

        ndb.get_context().clear_cache()

        app.config['TESTING'] = True

        self.app = app.test_client()
        set_fake_certs()
        self.user = setup_fake_user()

    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
        remove_fake_certs()

    def test_integration_logged_out(self):
        """ Ensure that integration data can't be fetched by an unauthorized user """
        rv = self.app.get("/api/integration")  # type: Response
        self.assertEqual(rv.status_code, 401)  # A query without the ?q= param should give a 400 code.

    def test_report_logged_in(self):
        """ Test to see if authorized user can get empty integration data. """
        rv = self.open_with_auth("/api/integration", 'GET')
        # Suppressing the pylint error for no-member
        # pylint: disable=maybe-no-member
        data = json.loads(rv.data)
        self.assertEqual(data, ApiResponse(payload={"integrations": []}))

    def test_get_integration(self):
        """Test to get the integration data. """
        self.create_fake_test_user()

        # Test to see if we get back the credentials.
        # This also tests to see if we don't get back the fake_user's credentials
        self.create_mock_credential(user=self.user.put(), type="github")
        rv = self.open_with_auth("/api/integration", 'GET')
        # Suppressing the pylint error for no-member
        # pylint: disable=maybe-no-member
        data = json.loads(rv.data)  # type: Response
        self.assertEqual(len(data['payload']['integrations']), 1)
        self.assertEqual(data['payload']['integrations'][0]['type'], 'github')

    def open_with_auth(self, url, method):
        fake_token = get_fake_jwt_token()
        return self.app.open(url, method=method, headers={"Authorization": "Bearer " + fake_token})

    def create_mock_credential(self, user, type, **kwargs):
        cred = Credential(
            user=user,
            type=type
        )
        # Save to the datatore.
        cred.put()

    # Create fake test user on the fly.
    def create_fake_test_user(self):
        # Create fake mock credential data on the fly.
        fake_user = User(user_id="fake_user", username="fake_username", email="fake@example.com").put()
        self.create_mock_credential(user=fake_user, type="github")
