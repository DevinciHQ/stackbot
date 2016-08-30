import sys, os
PATH = os.path.abspath(".")
sys.path.insert(1, PATH)
sys.path.insert(1, "/usr/local/google_appengine")

import dev_appserver
dev_appserver.fix_sys_path()
import google

print google.__path__

import google.appengine.ext
