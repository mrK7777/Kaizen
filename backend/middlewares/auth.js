const jwt = require('jsonwebtoken')
const ACCESS_TOKEN_SECRET = '60V8LAdnIKTjyBl2CwN5lJqydR2Pre8OmSHNzHx3NW5Rk7+QjpafExQWDPwjXR/PNnYgtyAPwOl411WgSRo48Q=='

function verifyAuth (req, res, next) {
    const accessToken = req.headers.authorization.split(' ')[1]
    let user 
    try {
        user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET)
    } catch (error) {
        console.log(error)
        return res.status(401).json('Login to continue')
    }

    res.locals.user = user
    next()
}

module.exports = verifyAuth