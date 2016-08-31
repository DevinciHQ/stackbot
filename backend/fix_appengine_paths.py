import sys, os
PATH = os.path.abspath(".")
sys.path.insert(1, PATH)
sys.path.insert(1, PATH + "/lib")

import os
appengine_env_var = os.environ['APPENGINE']

if not appengine_env_var:
    raise Exception("The $APPENGINE ENV var is missing. " +
                    "You should set it to the path of your SDK (/usr/local/google_appengine)")

if not os.path.isdir(appengine_env_var):
    raise Exception("The $APPENGINE ENV var is set, but the directory '" + appengine_env_var + "' doesn't exist.")

sys.path.insert(1, appengine_env_var)

import dev_appserver
dev_appserver.fix_sys_path()

# import google

# print google.__path__

import google.appengine.ext
