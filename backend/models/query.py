"""Defining the schema of Query table"""
# For use when dealing with the datastore.
from google.appengine.ext import ndb

# See https://cloud.google.com/appengine/docs/python/ndb/creating-entity-models
class Query(ndb.Model):
    """Define the columns for our Query table"""
    query = ndb.StringProperty(required=True)
    os = ndb.StringProperty()
    browser = ndb.StringProperty()
    timestamp = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    country = ndb.StringProperty()
    city = ndb.StringProperty()
    city_lat_long = ndb.StringProperty()
    ip = ndb.StringProperty()
    uid = ndb.StringProperty()
    source = ndb.StringProperty()
