import logging

from flask import request, abort, jsonify

from shared import app
from shared.security import verify_jwt_token
from models.user import User


#
# Commented code is UNTESTED, and should get tests or get a new look before implementing in production!
#


# @app.route('/api/user', methods=['POST'])
# def new_user():
#     # Use verify_token instead of authenticate_user because we need to use the token later
#     # to fill in the user information. Note that the way this is structured, a user can only
#     # create a user for themselves once via the API. (There are no other users with this power, ie admins)
#     verified_token = verify_jwt_token(request)
#     uid = verified_token.get('sub')
#     if not uid:
#         logging.error("User is missing user_id from token.")
#         abort(403)
#
#     # First ensure the user isn't already created.
#     user = User.get_by_user_id(uid)
#     if user:
#         logging.error("User: %s already exists." % uid)
#         abort(409)
#     key = User(
#         user_id=uid,
#         email=verified_token.get('email'),
#         email_verified=verified_token.get('email_verified'),
#         picture=verified_token.get('picture'),
#         username=verified_token.get('name'),
#     ).put()
#     return jsonify(key.id())
#
#
# @app.route('/api/user/:id', methods=['GET'])
# def get_user():
#     verified_token = verify_jwt_token(request)
#     uid = verified_token.get('sub')
#     if not uid:
#         logging.error("User is missing user_id from token.")
#         abort(403)
#
#     # First ensure the user isn't already created.
#     user = User.get_by_user_id(uid)
#     if user:
#         logging.error("User: %s already exists." % uid)
#         abort(409)
#     key = User(
#         user_id=uid,
#         email=verified_token.get('email'),
#         email_verified=verified_token.get('email_verified'),
#         picture=verified_token.get('picture'),
#         username=verified_token.get('name'),
#     ).put()
#     return jsonify(key.id())
#
