# For use when dealing with the datastore.
from google.appengine.ext import ndb


class User(ndb.Model):

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

        # TODO: We shouldn't have to worry about the number of credentials right now because we
        # only allow one per type.

        from credential import Credential

        credentials = Credential.query(Credential.user == self.key)
        if cred_type:
            credentials.filter(Credential.type == cred_type)
        keys = [cred.key for cred in credentials]
        return ndb.get_multi(keys)  # type: list[Credential | None]

    @staticmethod
    def get_by_user_id(user_id):
        return User.query(User.user_id == user_id).get()
        """ Returns a User from a user_id of one exists. """
