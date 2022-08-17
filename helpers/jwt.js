const { expressjwt: expressJwt } = require('express-jwt');  //difference here from tutor

function authJwt() {   //protection function
    const secret = process.env.secret;
    const api = process.env.API_URL;

    return expressJwt ({
        secret,
        algorithms: ['sha1', 'RS256', 'HS256'],  //we take this algoritm secret from jwt.io website
        isRevoked: isRevoked   //very important method for defining user and admin role
    }).unless({
        path: [
            //regular expressions used here
            // very important concept in programming so must clear this concept 
            //little confused in this
            {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] }, 
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] }, 
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] }, 
            {url: /\/api\/v1\/orders(.*)/ , methods: ['GET', 'OPTIONS'] }, 
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    });
}
async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true)
    }
    done();
}

module.exports = authJwt;