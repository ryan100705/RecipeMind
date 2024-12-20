
//Configure openid-client with values for the OIDC properties of your user pool
const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const app = express();
      
let client;
// Initialize OpenID Client
async function initializeClient() {
    const issuer = await Issuer.discover('https://cognito-idp.us-east-2.amazonaws.com/us-east-2_DSRcKrsz4');
    client = new issuer.Client({
        client_id: '28q0r97hfmf7re1qff54v043nt',
        client_secret: '<client secret>',
        redirect_uris: ['https://d84l1y8p4kdic.cloudfront.net'],
        response_types: ['code']
    });
};
initializeClient().catch(console.error);
//Configure the session middleware.
app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false
}));
//Add a middleware component that checks if a user is authenticated.
const checkAuth = (req, res, next) => {
    if (!req.session.userInfo) {
        req.isAuthenticated = false;
    } else {
        req.isAuthenticated = true;
    }
    next();
};

//Configure a home route at the root of your application. Include a check for users’ authenticated state
app.get('/', checkAuth, (req, res) => {
    res.render('home', {
        isAuthenticated: req.isAuthenticated,
        userInfo: req.session.userInfo
    });
});

//Configure a login route to direct to Amazon Cognito managed login for authentication with your authorization endpoint.
app.get('/login', (req, res) => {
    const nonce = generators.nonce();
    const state = generators.state();

    req.session.nonce = nonce;
    req.session.state = state;

    const authUrl = client.authorizationUrl({
        scope: 'phone openid email',
        state: state,
        nonce: nonce,
    });

    res.redirect(authUrl);
});

// Helper function to get the path from the URL. Example: "http://localhost/hello" returns "/hello"
function getPathFromURL(urlString) {
    try {
        const url = new URL(urlString);
        return url.pathname;
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}

app.get(getPathFromURL('https://d84l1y8p4kdic.cloudfront.net'), async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            'https://d84l1y8p4kdic.cloudfront.net',
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;

        res.redirect('/');
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect('/');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    const logoutUrl = `https://<user pool domain>/logout?client_id=28q0r97hfmf7re1qff54v043nt&logout_uri=<logout uri>`;
    res.redirect(logoutUrl);
});

app.set('view engine', 'ejs');