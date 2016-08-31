""" Test the Query API."""
import unittest
from google.appengine.ext import ndb, testbed
from handlers.api.query import app
from flask import Response, session


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
        # Clear ndb's in-context cache between tests.
        # This prevents data from leaking between tests.
        # Alternatively, you could disable caching by
        # using ndb.get_context().set_cache_policy(False)
        ndb.get_context().clear_cache()

        app.config['TESTING'] = True

        self.app = app.test_client()

    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()

    def login(self):
        session['user_id'] = 123

    def logout(self):
        session.clear()

    def test_new_query(self):
        """ Test the Query can be inserted via the API. """

        rv = self.app.get("/api/q")  # type: Response
        self.assertEqual(rv.status_code, 400)  # A query without the ?q= param should give a 400 code.

        rv = self.app.get("/api/q?q=TEST")  # type: Response
        self.assertEqual(rv.status_code, 401)  # An unauthorized user should get back a 401 code.

        # with app.test_client() as c:
        #     with c.session_transaction() as sess:
        #         sess['user_id'] = 123
        #     rv = self.app.get("/api/q?q=TEST")  # type: Response
        #     self.assertEqual(rv.status_code, 200)  # An use should be able to authenticate.
