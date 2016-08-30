"""
This modules allows us to store sensitive settings in the database.
"""
from google.appengine.ext import ndb


class Settings(ndb.Model):
    """Stores settings in the database.

    Notes:
        Taken from  http://stackoverflow.com/a/35261091 as a way to store
        sensitive settings in the database.

    """
    name = ndb.StringProperty()
    value = ndb.StringProperty()

    @staticmethod
    def get(name):
        """Store the actual settings in the database."""
        not_set_value = "_NOT_SET"
        retval = Settings.query(Settings.name == name).get()
        if not retval:
            retval = Settings()
            retval.name = name
            retval.value = not_set_value
            retval.put()
        if retval.value == not_set_value:
            raise Exception(('Setting %s not found in the database. A placeholder ' +
                             'record has been created. Go to the Developers Console for your app ' +
                             'in App Engine, look up the Settings record with name=%s and enter ' +
                             'its value in that record\'s value field.') % (name, name))
        return retval.value
