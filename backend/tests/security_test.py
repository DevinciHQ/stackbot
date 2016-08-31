""" Test the Query model."""
import unittest
import json
import time

from google.appengine.ext import ndb, testbed
from shared.security import PUBKEY
from shared import security

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


    # [START datastore_example_teardown]
    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
    # [END datastore_example_teardown]

    def testRefresh(self):
        """ Test if the cache holding the keys is refreshed. """
        self.removeFakeCerts()
        self.assertDictEqual(PUBKEY._keys, {})
        PUBKEY.refresh()
        self.assertIsNot(PUBKEY._keys, {})

    def testGetPublicCerts(self):
        """Test to check if we get back the public key back."""
        self.setFakeCerts()
        pkey = None
        # Obtain the CERT from the kid passed in which is converted into a public key and
        # returned to us.
        pkey = security.PUBKEY.get_public_cert("fc2da7fa53d92e3bcba8a17e74b34da9dd585065")
        self.assertIsNotNone(pkey)
        pub = open('./tests/test_data/public_key.txt', 'r').read()
        # This tests if the public key returned is same as what we have on the file.
        self.assertEqual(pkey, pub)

    def setFakeCerts(self):
        """Set the fake CERTS from the local file"""
        with open('./tests/test_data/firebase.certs.json') as data_file:
            security.PUBKEY._keys = json.load(data_file)
        now = time.time() + 60 * 60 * 24
        future = time.gmtime(now)
        security.PUBKEY._expires = future

    def removeFakeCerts(self):
        """Remove the fake CERTS and set the expiration time to None"""
        security.PUBKEY._keys = {}
        security.PUBKEY._expires = None