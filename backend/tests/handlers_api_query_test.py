""" Test the Query API."""
import unittest
from google.appengine.ext import ndb, testbed
from handlers.api.query import app
from flask import Response, session
from context import get_fake_jwt_token, remove_fake_certs, set_fake_certs, setup_fake_user
import handlers.api.query as query


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
        set_fake_certs()

    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
        remove_fake_certs()

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

        rv = self.open_with_auth("/api/q?q=TEST&source=site-search", "GET")  # type: Response
        # Suppressing the pylint error for no-member
        # pylint: disable=maybe-no-member
        self.assertEqual(rv.status_code, 200)  # An use should be able to authenticate.

    def test_empty_hashtag(self):
        """ Testing the empty hashtag case."""
        # Empty hashtag should be considered a part of the actual query.
        query_string = query.get_query("# #this is test")
        tags = query.get_tags("# #this is test")
        self.assertEqual(query_string, "# #this is test")
        self.assertEqual(tags, [])

    def test_hashtag(self):
        """ Testing the hashtag feature."""
        # Test to check if hashtag starts with a '#' symbol.
        tags = query.get_tags("#this is a test")
        self.assertEqual(tags, ["this"])

        # Test to see if multiple hash tags work.
        tags = query.get_tags("#this-is #testing the hashtag")
        self.assertEqual(tags, ["this-is", "testing"])

        # Test to not include a hashtag if it is not at the beginning of the query
        tags = query.get_tags("#this-is for #testing the hashtag")
        self.assertEqual(tags, ["this-is"])

    def test_remove_hashtags(self):
        """ Test to remove the hashtags out of the search query for storing it
        in the query column."""

        search_query = query.get_query("#this is a #test")
        self.assertEqual(search_query, "is a #test")

    def open_with_auth(self, url, method):
        fake_token = get_fake_jwt_token()
        return self.app.open(url, method=method, headers={"Authorization": "Bearer " + fake_token},
                             environ_base={'HTTP_USER_AGENT': 'Chrome', 'REMOTE_ADDR': '127.0.0.1'})
