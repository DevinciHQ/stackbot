""" Test the Query model."""
import unittest

from google.appengine.ext import ndb, testbed

from models.query import Query

from context import get_fake_jwt_token, remove_fake_certs, set_fake_certs, setup_fake_user

# [START datastore_example_test]
class DatastoreTestCase(unittest.TestCase):
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

        set_fake_certs()

        self.user = setup_fake_user()

# [END datastore_example_test]

    # [START datastore_example_teardown]
    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
        remove_fake_certs()
    # [END datastore_example_teardown]

    def test_insert_query(self):
        """ Test the Query can be inserted. """
        test_query = Query(query="google", ip='127.0.0.1', source='site-search', user=self.user.key).put()
        self.assertEqual("google", test_query.get().query)
