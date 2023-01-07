const express = require("express")
const route = express.Router()
const dataSantiser = require("../middleware/DataSanitiser")
const responses = require("../responses.json")
const bcrypt = require("bcrypt")
const getDate = require("../utilities/date")
const crypto = require("crypto")
const User = require("../models/User")
const db = require("../db/DynamoDbDatabase")

const users = []

route.get("/", (req, res) => {
    res.status(200)

    listOfUsers = []

    users.forEach(user => {
        listOfUsers.push(user.getUser())
    })

    res.json(listOfUsers)
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

    const foundUser = users.find(user => user.getEmail() === req.body.email)
    if(foundUser) return res.status(responses.statusCodes.conflict).json({message: responses.messages.userExists})

    if(password !== repeatPassword) return res.status(responses.statusCodes.badReq).json({message: responses.messages.passwordsMustMatch})

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User(db.getDynamoDocClient())
        user.setId(id)
        user.setEmail(email)
        user.setPassword(hashedPassword)
        user.setDateJoined(dateJoined)
        user.setBlocked(blocked)

        const result = user.create()
        if(result !== 0) return res.status(responses.statusCodes.internalServerError).json({message: result})

        res.status(responses.statusCodes.created)
        res.json({message: responses.messages.userCreated, user: user.getUser()})
    }
    catch(err) {
        res.status(responses.statusCodes.internalServerError).json({message: responses.messages.internalServerError})
    }
})

module.exports = route