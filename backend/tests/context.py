import time
import json

import shared.security as security


def get_fake_jwt_token():
    with open('./tests/test_data/fake_jwt_token.txt') as data_file:
        # We need to delete new lines from the file or we get an crypto padding error.
        fake_token = data_file.read().replace('\n', '')

    return fake_token


def set_fake_certs():
    """Set the fake CERTS from the local file"""
    with open('./tests/test_data/firebase.certs.json') as data_file:
        security.PUBKEY._keys = json.load(data_file)
    now = time.time() + 60 * 60 * 24
    future = time.gmtime(now)
    security.PUBKEY._expires = future


def remove_fake_certs():
    """Remove the fake CERTS and set the expiration time to None"""
    security.PUBKEY._keys = {}
    security.PUBKEY._expires = None
