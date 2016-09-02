var http = require('http'),
    httpProxy = require('http-proxy'),
    fs = require('fs');
    //
    // Create your proxy server and set the target in the options.
    //
    var stackbot_frontend = 'https://0-1-6.devinci-stackbot.appspot.com'

    proxy = httpProxy.createProxyServer({
        target: stackbot_frontend,
        changeOrigin: true,
        host: "0.0.0.0",
        secure: false,
        ssl: {
            key: fs.readFileSync('server.key', 'utf8'),
            cert: fs.readFileSync('server.crt', 'utf8')
        }
    }
    ).listen(443);

   console.log("Proxy to ", stackbot_frontend, " started. Listening on port 443...");
   console.log("To Use: Update your host to point stackbot.com to 127.0.0.1 and then visit https://stackbot.com");

    proxy.on('error', function (err, req, res) {
        console.log(err);
    });

