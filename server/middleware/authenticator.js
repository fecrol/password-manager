const jwt = require("jsonwebtoken")
const responses = require("../responses.json")
if(process.env.NODE_ENV !== "production") require("dotenv").config({ path: "../../.env" })

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if(!token) return res.status(responses.statusCodes.unauthorized).json({message: responses.messages.unauthorized})

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(responses.statusCodes.forbidden).json({message: responses.messages.forbidden})

        req.user = user
        next()
    })
}

function generateJwtToken({user, secret, expirationTime}) {
    return expirationTime ? jwt.sign({user_id: user.user_id}, secret, {expiresIn: expirationTime}) : jwt.sign({user_id: user.user_id}, secret)
}

module.exports = {
    authenticateToken,
    generateJwtToken
}
