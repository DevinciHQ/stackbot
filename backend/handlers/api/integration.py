"""This module checks handles defines the working of the /api/integration
route"""
import logging

from flask import request, abort, jsonify
from shared import app, ApiResponse
from shared.security import authenticate_user, ExpiredSignatureError


@app.route('/api/integration', methods=['GET'])
def get_integrations():
    """This method returns the integrations data if it passes the authentication test"""
    creds = []
    try:
        user = authenticate_user(request)
        creds = user.credentials()
    except ExpiredSignatureError as err:
        logging.warn(err)
        abort(401)

    data = []
    for cred in creds:
        data.append({
            'id': cred.key.id(),
            'type': cred.type
        })

    output = {
        'success': True,
        'payload': {"integrations": data}
    }
    return jsonify(ApiResponse(output))

#
# @app.route('/api/credential', methods=['GET'])
# def post_credential():
#     user_id = None
#     try:
#         user_id = security.verify_request(request).get('sub')
#     except security.ValidationException as err:
#         # IF the user isn't logged in, then throw a 403 error.
#         logging.error(err)
#         abort(403)
#
#     body = json.loads(request.data)
#     credential = Credential(token=body.get('token', ''))
#     credential.key = ndb.Key(User, user_id, Credential, body.get('type'))
#     credential.put()
#
#     output = {
#         'success': True,
#         'payload': body
#     }
#     return json.dumps(output)
