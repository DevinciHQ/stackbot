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

        _NOT_SET_VALUE = "_NOT_SET"
        retval = Settings.query(Settings.name == name).get()
        if not retval:
            retval = Settings()
            retval.name = name
            retval.value = _NOT_SET_VALUE
            retval.put()
        if retval.value == _NOT_SET_VALUE:
            raise Exception(('Setting %s not found in the database. A placeholder ' +
                             'record has been created. Go to the Developers Console for your app ' +
                             'in App Engine, look up the Settings record with name=%s and enter ' +
                             'its value in that record\'s value field.') % (name, name))
        return retval.value
