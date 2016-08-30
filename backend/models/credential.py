# For use when dealing with the datastore.
from google.appengine.ext import ndb


# See https://cloud.google.com/appengine/docs/python/ndb/creating-entity-models
class Credential(ndb.Model):
    from models.user import User

    user = ndb.KeyProperty(User, required=True)
    type = ndb.StringProperty(choices=['github'])
    token = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    scopes = ndb.StringProperty(repeated=True)
    # TODO: We may consider adding an enabled flag where the user could disable
    # an integration without us loosing the key completely.
    # enabled = ndb.BooleanProperty()
