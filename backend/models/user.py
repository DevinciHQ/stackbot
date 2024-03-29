"""Defining the schema of the User table in the datastore"""
# For use when dealing with the datastore.
from google.appengine.ext import ndb


class User(ndb.Model):
    """Define the columns of the User table"""
    user_id = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    email_verified = ndb.BooleanProperty(default=False)
    # first_name = ndb.StringProperty(required=True)
    # last_name = ndb.StringProperty(required=True)
    picture = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    def credentials(self, cred_type=None):
        """ Returns all the user's credentials. """
        import models.credential as m

        # TODO: We shouldn't have to worry about the number of credentials right now because we
        # only allow one per type.

        credentials = m.Credential.query(m.Credential.user == self.key)
        if cred_type:
            credentials.filter(m.Credential.type == cred_type)
        keys = [cred.key for cred in credentials]
        return ndb.get_multi(keys)  # type: list[m.Credential | None]

    @staticmethod
    def get_by_user_id(user_id):
        """ Returns a User from a user_id of one exists. """
        return User.query(User.user_id == user_id).get()
