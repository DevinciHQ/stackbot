# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import webapp2
import logging, os
from  handlers import report, query


""" ------------- MAIN ------------------ """

logging.debug('SERVER_SOFTWARE', os.getenv('SERVER_SOFTWARE', ''))
# Set a flag for what environment we're in.
if os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/'):
    # Running on Google AppEngine
    env = 'production'
else:
    # Running locally using dev_appserver.py
    env = 'local'

# Actually run the webserver and accept requests.
app = webapp2.WSGIApplication([
    ('/api/q', query.QueryHandler),
    ('/api/report', report.ReportHandler),
], debug=True)


