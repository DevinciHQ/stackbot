# Stackbot

Stackbot is a tool to make your development task easier. It gives you feedback based on your coding styles,
motivates you to be more productive and helps you to search coding related questions in a breeze.

## Installation

* Clone the repo from https://github.com/DevinciHQ/stackbot
* Change to the stackbot directory.
* You need to install ahoy for the automation of lengthy commands. [Ahoy](https://github.com/DevinciHQ/ahoy)

## Usage

* Start the server: `ahoy up`
* Go to [http://127.0.0.1:8080/](http://127.0.0.1:8080/) to view the page.
* Make local changes. The server will detect the changes so you don't need to restart the server.
* Test it locally and deploy the application to Google App Engine: `ahoy deploy <version-number>`


## Debugging

* Enable Google App Engine support checkbox under Prefs > Languages & Frameworks > Google App Engine
* Set the SDK, probably in /usr/local/google_appengine on OSX.
* Ensure you have a 'Google App Engine' Debug configuration setup and to use that for debugging.
* Make sure you don't have `ahoy up` already serving the site or the ports will conflict.
