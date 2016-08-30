"""Define a method to get the geo headers from the request and a method that returns
 response with empty payload and success == true in it"""
from flask import Flask
APP = Flask(__name__)


class ApiResponse(dict):
    """ A standard API response object that defaults to an empty payload and success == true. """

    def __init__(self, payload=None, success=None):
        payload = payload if payload is not None else {}
        success = success if success is not None else True
        dict.__init__(self, success=success, payload=payload)


def get_geo_data(request):
    """ Get the geolocation data from the request. """

    # Note that geoip2 (from maximind) doesn't work on GAE because there is a
    # C lib in there apparently.
    # We can use Appengine's added headers to do that work though thankfully.
    geo = dict()
    geo['region'] = request.headers.get("X-AppEngine-Region", "unknown")
    geo['city'] = request.headers.get("X-AppEngine-City", "unknown")
    geo['country'] = request.headers.get("X-AppEngine-Country", "unknown")
    geo['city_lat_long'] = request.headers.get("X-AppEngine-CityLatLong", "unknown")

    return geo
