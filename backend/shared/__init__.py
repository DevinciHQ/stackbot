from flask import Flask
app = Flask(__name__)


class ApiResponse(dict):

    def __init__(self, payload=None, success=None):
        payload = payload if payload is not None else {}
        success = success if success is not None else True
        dict.__init__(self, success=success, payload=payload)
