"""Defining the schema of Query table"""
# For use when dealing with the datastore.
from google.appengine.ext import ndb

# A simple Datastore Entity that takes any values (good for development)
# See https://cloud.google.com/appengine/docs/python/ndb/creating-entity-models
class Query(ndb.Expando):
    """Let the schema of Query table be generic as of now.
       We need to change this in future."""
    pass
