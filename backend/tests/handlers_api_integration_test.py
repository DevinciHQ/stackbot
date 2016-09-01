""" Test the Integration API."""
import unittest
import json
from google.appengine.ext import ndb, testbed
from handlers.api.integration import app
from context import get_fake_jwt_token, remove_fake_certs, set_fake_certs, setup_fake_user, MockRequest
from shared import ApiResponse
from flask import Response

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

    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
        remove_fake_certs()

    def test_get_integration(self):
        """Test to get the integration data if it exists. """

        rv = self.app.get("/api/integration")  # type: Response
        self.assertEqual(rv.status_code, 401)  # A query without the ?q= param should give a 400 code.

        rv = self.open_with_auth("/api/integration", 'GET')
        # Suppressing the pylint error for no-member
        # pylint: disable=maybe-no-member
        data = json.loads(rv.data)
        self.assertEqual(data, ApiResponse(payload={"integrations": []}))

    def open_with_auth(self, url, method):
        fake_token = get_fake_jwt_token()
        return self.app.open(url, method=method, headers={"Authorization": "Bearer " + fake_token})
