const express = require("express")
const route = express.Router()
const dataSantiser = require("../middleware/DataSanitiser")
const responses = require("../responses.json")
const bcrypt = require("bcrypt")
const getDate = require("../utilities/date")
const crypto = require("crypto")
const User = require("../models/User")
const db = require("../db/DynamoDbDatabase")
const jwt = require("jsonwebtoken")

if(process.env.NODE_ENV !== "production") require("dotenv").config({ path: "../../.env" })

route.get("/users", async (req, res) => {
    const user = new User({docClient: db.getDynamoDocClient()})
    const users = await user.readAll()

    users.forEach(user => {
        if(user.password) delete user.password
    })

    res.status(responses.statusCodes.ok).json(users)
})

route.get("/users/:id", async (req, res) => {
    const id = req.params.id;

    const user = new User({docClient: db.getDynamoDocClient()})
    const foundUser = await user.readById(id)

    if(foundUser.password) delete foundUser.password

    res.status(responses.statusCodes.ok).json(foundUser)
})

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

        const accessToken = jwt.sign({id: foundUser.id}, process.env.ACCESS_TOKEN_SECRET)
        
        res.status(responses.statusCodes.created).json({accessToken})
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