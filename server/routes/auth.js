const express = require("express")
const route = express.Router()
const dataSantiser = require("../middleware/DataSanitiser")
const responses = require("../responses.json")
const bcrypt = require("bcrypt")
const getDate = require("../utilities/date")
const crypto = require("crypto")
const User = require("../models/User")
const db = require("../db/DynamoDbDatabase")
const authenticator = require("../middleware/authenticator")

if(process.env.NODE_ENV !== "production") require("dotenv").config({ path: "../../.env" })

route.post("/login", dataSantiser.sanitise(), async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    if(!email) return res.status(responses.statusCodes.badReq).json({message: responses.messages.emailRequired})
    if(!password) return res.status(responses.statusCodes.badReq).json({message: responses.messages.passwordRequired})

    const user = new User({docClient: db.getDynamoDocClient()})
    const foundUser = await user.readByEmail(email)

    if(!foundUser) return res.status(responses.statusCodes.badReq).json({message: responses.messages.invalidEmail})

    try {
        const passwordIsCorrect = await bcrypt.compare(password, foundUser.password)
        if(!passwordIsCorrect) return res.status(responses.statusCodes.badReq).json({message: responses.messages.invalidPassword})

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
        const accessTokenDuration = process.env.ACCESS_TOKEN_DURATION

        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET
        
        const accessToken = authenticator.generateJwtToken({user: foundUser, secret: accessTokenSecret, expirationTime: accessTokenDuration})
        const refreshToken = authenticator.generateJwtToken({user: foundUser, secret: refreshTokenSecret})
        
        res.status(responses.statusCodes.created).json({accessToken, refreshToken})
    } 
    catch {
        res.status(responses.statusCodes.internalServerError).json({message: responses.messages.internalServerError})
    }
})

route.post("/register", dataSantiser.sanitise(), async (req, res) => {

    const id = crypto.randomUUID()
    const email = req.body.email 
    const password = req.body.password
    const repeatPassword = req.body.repeatPass
    const dateJoined = getDate()
    const blocked = false

    if(!email) return res.status(responses.statusCodes.badReq).json({message: responses.messages.emailRequired})
    if(!password || !repeatPassword) return res.status(responses.statusCodes.badReq).json({message: responses.messages.passwordRequired})

    const user = new User({docClient: db.getDynamoDocClient()})

    const foundUser = await user.readByEmail(email)
    if(foundUser) return res.status(responses.statusCodes.conflict).json({message: responses.messages.userExists})

    if(password !== repeatPassword) return res.status(responses.statusCodes.badReq).json({message: responses.messages.passwordsMustMatch})

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        user.setUser({id, email, password: hashedPassword, dateJoined, blocked})

        const result = await user.create()
        if(!result.user) return res.status(responses.statusCodes.internalServerError).json({message: result})

        res.status(responses.statusCodes.created).json({user: result.user})
    }
    catch(err) {
        res.status(responses.statusCodes.internalServerError).json({message: responses.messages.internalServerError})
    }
})

module.exports = route