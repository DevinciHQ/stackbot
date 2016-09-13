""" Test the Query model."""
import unittest

from google.appengine.ext import ndb, testbed
from shared.security import PUBKEY
from shared import security
from jwt import DecodeError
from context import get_fake_jwt_token, MockRequest, remove_fake_certs, set_fake_certs
import json
from shared import app
from flask import session



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

        set_fake_certs()
        app.debug = True
        app.secret_key = 'development'

    # [START datastore_example_teardown]
    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
        remove_fake_certs()
    # [END datastore_example_teardown]

    def test_refresh(self):
        """ Test if the cache holding the keys is refreshed. """
        remove_fake_certs()
        self.assertDictEqual(PUBKEY._keys, {})
        PUBKEY.refresh()
        self.assertIsNot(PUBKEY._keys, {})

    def test_get_public_certs(self):
        """Test to check if we get back the public key back."""
        # Obtain the CERT from the kid passed in which is converted into a public key and
        # returned to us.
        test_public_key = security.PUBKEY.get_public_cert("fakecert123")
        self.assertIsNotNone(test_public_key)
        with open('./tests/test_data/fake_public_key.txt', 'r') as key_file:
            accepted_public_key = key_file.read().strip()
        # This tests if the public key returned is same as what we have on the file.
        # Strip out the whitespace.
        self.assertEqual(accepted_public_key, test_public_key)

    def test_token_decryption(self):
        fake_token = get_fake_jwt_token()
        decrypted_payload = security.verify_jwt_token(fake_token)
        with open('./tests/test_data/fake_jwt_payload.json', 'r') as payload_file:
            accepted_payload = json.loads(payload_file.read())
        self.assertEqual(decrypted_payload, accepted_payload)


    def test_user_jwt_authentication(self):

        # Authorization header missing.
        with self.assertRaises(security.ValidationError) as cm:
            request = MockRequest(headers={})
            user_id = security.get_user_id_from_token(security.verify_jwt_request(request))
        self.assertEqual("Authorization header is missing.", str(cm.exception))

        # Authorization header is not of type 'Bearer'.
        with self.assertRaises(security.ValidationError) as cm:
            request = MockRequest(headers={"Authorization": "Basic"})
            user_id = security.get_user_id_from_token(security.verify_jwt_request(request))
        self.assertEqual("Authorization header is not of type 'Bearer'.", str(cm.exception))

        # Not enough segments
        # TODO: We're not catching this DecodeError exception like we should be.
        with self.assertRaises(DecodeError) as cm:
            request = MockRequest(headers={"Authorization": "Bearer FAIL"})
            user_id = security.get_user_id_from_token(security.verify_jwt_request(request))
        self.assertEqual("Not enough segments", str(cm.exception))

        # Signature verification failed
        # TODO: We're not catching this DecodeError exception like we should be.
        with self.assertRaises(DecodeError) as cm:
            mangled_token = get_fake_jwt_token() + "F"
            request = MockRequest(headers={"Authorization": "Bearer " + mangled_token})
            user_id = security.get_user_id_from_token(security.verify_jwt_request(request))
        self.assertEqual("Signature verification failed", str(cm.exception))

        # Using the proper fake_token, make sure the user can be authenticated.
        fake_token = get_fake_jwt_token()
        request = MockRequest(headers={"Authorization": "Bearer " + fake_token})
        user_id = security.get_user_id_from_token(security.verify_jwt_request(request))
        self.assertEqual(user_id, "fakeuser123")

    def test_set_auth_session_cookie(self):
        with app.test_request_context():
            fake_token = get_fake_jwt_token()

            request = MockRequest(headers={"Authorization": "Bearer "+fake_token})
            security.set_auth_session_cookie(request)
            test_user_id = session.get("user_id", "SHOULD NOT BE THIS")
            self.assertEqual(test_user_id, "fakeuser123")

            test_user_id = security.get_auth_session_cookie()
            self.assertEqual(test_user_id, "fakeuser123")

            security.delete_auth_session_cookie()
            test_user_id = security.get_auth_session_cookie()
            self.assertIs(None, test_user_id)

    def test_authentication(self):
        with app.test_request_context():
            empty_request = MockRequest(headers={})
            fake_token = get_fake_jwt_token()
            auth_request = MockRequest(headers={"Authorization": "Bearer " + fake_token})

            with self.assertRaises(security.ValidationError) as cm:
                security.set_auth_session_cookie(empty_request)
            self.assertEqual("Authorization header is missing.", str(cm.exception))

            with self.assertRaises(security.ValidationError) as cm:
                user = security.authenticate_user(empty_request)
            self.assertEqual("Authorization header is missing.", str(cm.exception))

            with self.assertRaises(security.AuthenticationError) as cm:
                security.set_auth_session_cookie(auth_request)
                user = security.authenticate_user(empty_request)
            self.assertEqual("User cannot be created without a verified token.", str(cm.exception))

            # Create a user first, and then try to auth with just the cookie successfully.
            user = security.authenticate_user(auth_request)
            security.set_auth_session_cookie(auth_request)
            user = security.authenticate_user(empty_request)

    def test_is_request_with_auth(self):
        with app.test_request_context():
            # Expect that requests without an Authorization header return False
            empty_request = MockRequest(headers={})
            self.assertEqual(security.is_request_with_auth(empty_request), False)

            # Expect that requests with an Authorization header return True;
            auth_request = MockRequest(headers={"Authorization": "anything"})
            self.assertEqual(security.is_request_with_auth(auth_request), True)
