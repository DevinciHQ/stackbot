""" Test the Query model."""
import unittest
import datetime

from google.appengine.ext import ndb, testbed
from google.appengine.ext.db import BadValueError

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

    # [START datastore_example_insert]
    def testInsertEntity(self):
        """ Test the Query can be inserted. """
        User(user_id="fake", username="fake", email="fake").put()
        self.assertEqual(1, len(User.query().fetch(2)))
    # [END datastore_example_insert]

    def testInsertInteger(self):
        """ Test to see that user_id cannot be an integer. """
        # Should not be able to insert user_id with an integer value.
        with self.assertRaises(Exception) as cm:
            User(user_id=12, username="fake", email="fake").put()
        self.assertEqual("Expected string, got 12", str(cm.exception))

    def testInsertDefualtFields(self):
        """ Test to see if the default fields are created by default. """
        user = User(user_id="fake", username="fake", email="fake").put().get()

        original_updated = user.updated
        original_created = user.created

        # Check that the default timestamps are created for now.
        seconds_diff = (user.updated - user.created).total_seconds()
        self.assertLess(seconds_diff, 1)

        user = user.put().get()

        self.assertGreater(user.updated, original_updated)
        self.assertEqual(user.created, original_created)
