""" Test the Credential model."""
import unittest

from google.appengine.ext import ndb, testbed
from google.appengine.ext.db import BadValueError

from models.credential import Credential
from models.user import User

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

# [END datastore_example_test]

    # [START datastore_example_teardown]
    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
    # [END datastore_example_teardown]


    def testCredentialType(self):
        """ Test the 'type' field of the credential table"""
        try:
            user_key = User(user_id="fake", username="fake", email="fake").put()
            Credential(user=user_key, type="linkedin", token="fgshADSF1324")
        except BadValueError:
            print("Credential type 'linkedin' is not supported.")

