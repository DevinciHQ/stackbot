# For use when dealing with the datastore.
from google.appengine.ext import ndb

class User(ndb.Model):

    user_id = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    email_verified = ndb.BooleanProperty(default=False)
    #first_name = ndb.StringProperty(required=True)
    #last_name = ndb.StringProperty(required=True)
    picture = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

