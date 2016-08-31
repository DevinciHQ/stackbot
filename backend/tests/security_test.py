""" Test the Query model."""
import unittest

from google.appengine.ext import ndb, testbed
from shared.security import PUBKEY

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
        # This allows us to use the GAE's urlfetch method within
        # the tests. See: http://stackoverflow.com/a/31975818
        self.testbed.init_urlfetch_stub()

    # [END datastore_example_test]

    # [START datastore_example_teardown]
    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
    # [END datastore_example_teardown]

    def testRefresh(self):
        """ Test if the cache holding the keys is refreshed. """
        self.assertDictEqual(PUBKEY._keys, {})
        PUBKEY.refresh()
        self.assertIsNot(PUBKEY._keys, {})
