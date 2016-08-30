"""Expose all the libraries to google app engine"""
# Solution for adding vendored libraries.
# See https://cloud.google.com/appengine/docs/python/tools/using-libraries-python-27
from google.appengine.ext import vendor

# Add any libraries installed in the "lib" folder.
vendor.add('lib')
