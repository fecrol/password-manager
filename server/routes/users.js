const express = require("express")
const route = express.Router()
const dataSantiser = require("../middleware/DataSanitiser")
const responses = require("../responses.json")
const bcrypt = require("bcrypt")
const getDate = require("../utilities/date")
const crypto = require("crypto")

const users = []

route.get("/", (req, res) => {
    res.status(200)
    res.json(users)
})

route.post("/register", dataSantiser.sanitise(), async (req, res) => {

    const id = crypto.randomUUID()
    const email = req.body.email 
    const password = req.body.password
    const dateJoined = getDate()
    const blocked = false

    if(!email) return res.status(responses.statusCodes.badReq).json({message: responses.messages.emailRequired})
    if(!password) return res.status(responses.statusCodes.badReq).json({message: responses.messages.passwordRequired})

    const foundUser = users.find(user => user.email === req.body.email)
    
    if(foundUser) return res.status(responses.statusCodes.conflict).json({message: responses.messages.userExists})

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = {id, email, dateJoined, blocked}
        users.push(user)

        res.status(responses.statusCodes.created)
        res.json({message: responses.messages.userCreated, user: user})
    }
    catch {
        res.status(responses.statusCodes.internalServerError).json({message: responses.messages.internalServerError})
    }
})

module.exports = route