""" Test the Query model."""
import unittest

from google.appengine.ext import ndb, testbed
from shared.security import PUBKEY
from shared import security
import context

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

        context.set_fake_certs()

    # [START datastore_example_teardown]
    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
        context.remove_fake_certs()
    # [END datastore_example_teardown]

    def test_refresh(self):
        """ Test if the cache holding the keys is refreshed. """
        context.remove_fake_certs()
        self.assertDictEqual(PUBKEY._keys, {})
        PUBKEY.refresh()
        self.assertIsNot(PUBKEY._keys, {})

    def test_get_public_certs(self):
        """Test to check if we get back the public key back."""
        pkey = None
        # Obtain the CERT from the kid passed in which is converted into a public key and
        # returned to us.
        pkey = security.PUBKEY.get_public_cert("fakecert123")
        self.assertIsNotNone(pkey)
        pub = open('./tests/test_data/fake_public_key.txt', 'r').read()
        # This tests if the public key returned is same as what we have on the file.
        # Strip out the whitespace.
        self.assertEqual(str(pkey).strip(), str(pub).strip())

    def test_token_decryption(self):
        fake_token = context.get_fake_jwt_token()
        security.verify_jwt_token(fake_token)


