/*************************/
/*** Import used modules */
const jwt = require('jsonwebtoken')

/********************************/
/*** Extract token from headers */
const extractBearer = authorization => {

    if(typeof authorization !== 'string'){
        return false
    }

    // Regexp to isole token
    const matches = authorization.match(/(bearer)\s+(\S+)/i)

    return matches && matches[2]

}


/*******************************************/
/*** Check if token is present and test it */
const checkTokenMiddleware = (req, res, next) => {

    const token = req.headers.authorization && extractBearer(req.headers.authorization)

    if(!token){
        return res.status(401).json({ message: 'Ho le petit malin !!!'})
    }

    // Check validity
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if(err){
            return res.status(401).json({message: 'Bad token'})
        }

        next()
    })
}

module.exports = checkTokenMiddleware