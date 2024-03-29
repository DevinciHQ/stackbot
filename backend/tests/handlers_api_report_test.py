""" Test the Query API."""
import unittest
import json
from datetime import datetime, timedelta
from google.appengine.ext import ndb, testbed
from handlers.api.report import app
from flask import Response, jsonify
from context import get_fake_jwt_token, remove_fake_certs, set_fake_certs, setup_fake_user
from shared import ApiResponse, security
from models.query import Query


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

        self.user = setup_fake_user()

    def tearDown(self):
        """ Tear down the test. """
        self.testbed.deactivate()
        remove_fake_certs()

    def test_report_logged_out(self):
        """ Ensure a report can't be fetched by a user """

        rv = self.app.get("/api/report")  # type: Response
        self.assertEqual(rv.status_code, 401)  # An unauthorized user should get back a 401 code.

    def test_report_logged_in(self):

        rv = self.open_with_auth("/api/report", 'GET')
        # Suppressing the pylint error for no-member
        # pylint: disable=maybe-no-member
        self.assertEqual(json.loads(rv.data), ApiResponse([])) #Expect an empty, but successful response.

    def test_report_list(self):
        now = datetime.utcnow()
        for i in range(3):
            ago = now - timedelta(hours=i)
            self.create_mock_query(
                self.user,
                query="test_query_"+str(i),
                timestamp=str(ago),  # make each time further in the past
                tags=["test"]
            )
        rv = self.open_with_auth("/api/report", 'GET')
        # Suppressing the pylint error for no-member
        # pylint: disable=maybe-no-member
        data = json.loads(rv.data) # type: Response
        self.assertEqual(len(data['payload']), 3)  # Expect three items
        self.assertEqual(data['payload'][0]['query'], "test_query_0")

    def test_report_tag(self):
        """Test to check if we can retrieve the tag field from the database"""

        self.create_mock_query(self.user, query="#test test_query", tags=["test"])

        rv = self.open_with_auth("/api/report", 'GET')
        # Suppressing the pylint error for no-member
        # pylint: disable=maybe-no-member
        data = json.loads(rv.data) # type: Response
        self.assertEqual(data['payload'][0]['tags'], ["test"])

    def test_send_more_data(self):
        """ Test to check if we can send more data upon request. """
        now = datetime.utcnow()
        for i in range(6):
            ago = now - timedelta(hours=i)
            self.create_mock_query(
                self.user,
                query=str(i),
                timestamp=str(ago),  # make each time further in the past
                tags=["test"]
            )

        # Make a request to fetch 3 items.
        rv = self.open_with_auth("/api/report?limit=3", 'GET')
        # Suppressing the pylint error for no-member
        # pylint: disable=maybe-no-member
        data = json.loads(rv.data) # type: Response
        cursor = data['cursor']
        self.assertEqual(len(data['payload']), 3)  # Expect three items

        # Make a request to send 3 more items.
        rv = self.open_with_auth("/api/report?limit=3&cursor="+cursor, 'GET')
        # Suppressing the pylint error for no-member
        # pylint: disable=maybe-no-member
        data = json.loads(rv.data)  # type: Response
        cursor = data['cursor']
        self.assertEqual(len(data['payload']), 3)  # Expect three more items

        # Test if we hit the end of the datastore
        self.assertEqual(cursor, None)

    def open_with_auth(self, url, method):
        fake_token = get_fake_jwt_token()
        return self.app.open(url, method=method, headers={"Authorization": "Bearer " + fake_token})

    def create_mock_query(self, user, **kwargs):
        query = Query(
            query=kwargs['query'],
            os="Mac OS X Version: 10.11.6",
            browser="Chrome",
            timestamp=kwargs.get('timestamp', datetime.utcnow().isoformat()),
            country="US",
            city="new york",
            city_lat_long="40.714353,-74.005973",
            ip="127.0.0.1",
            uid=user.user_id,
            user=user.key,
            source="site-search",
            tags=kwargs['tags']
        )
        # Save to the datatore.
        query.put()

