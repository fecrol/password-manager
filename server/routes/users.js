const express = require("express")
const route = express.Router()
const dataSantiser = require("../middleware/DataSanitiser")
const responses = require("../responses.json")
const bcrypt = require("bcrypt")
const getDate = require("../utilities/date")
const crypto = require("crypto")
const User = require("../models/User")
const db = require("../db/DynamoDbDatabase")

route.get("/", async (req, res) => {
    const user = new User({docClient: db.getDynamoDocClient()})
    res.send(await user.readAll())
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
        user.setUser({id, email, hashedPassword, dateJoined, blocked})

        const result = await user.create()
        if(!result.user) return res.status(responses.statusCodes.internalServerError).json({message: result})

        res.status(responses.statusCodes.created)
        res.json({user: result.user})
    }
    catch(err) {
        res.status(responses.statusCodes.internalServerError).json({message: responses.messages.internalServerError})
    }
})

module.exports = route