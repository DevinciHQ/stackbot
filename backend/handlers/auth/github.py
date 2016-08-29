from werkzeug import security

from shared.oauth import OauthHandler, app, request

github_config = {
    # These are the "Stackbot Dev" credentials. Still, we shouldn't commit to code.
    #'consumer_key': '',
    #'consumer_secret': '',
    'request_token_params': {'scope': 'user:email', 'state': lambda: security.gen_salt(10)},
    'base_url': 'https://api.github.com/',
    'request_token_url': None,
    'access_token_method': 'POST',
    'access_token_url': 'https://github.com/login/oauth/access_token',
    'authorize_url': 'https://github.com/login/oauth/authorize'
}

github = OauthHandler('github', github_config)


@app.route('/auth/github')
def get():
    return github.get()


@app.route('/auth/github/add')
def add():
    return github.add()


@app.route('/auth/github/delete')
def delete():
    return github.delete()


@app.route('/auth/github/authorized_callback')
def authorized():
    return github.authorized()


@github.oauth_app.tokengetter
def token_getter():
    user = github.authenticate_user(request)
    return github.get_credential(user)



