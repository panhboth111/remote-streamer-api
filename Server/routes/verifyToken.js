const jwt = require('jsonwebtoken')

module.exports = function auth (req, res, next) {
    const token = req.header('auth-token')
    if (!token) return res.json({"token_failed" : "Access Denied"})

    try{
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    }catch(err){
        res.json({"message" : "Invalid Token"})
    }
}