const express = require("express")
const route = express.Router()
const dataSantiser = require("../middleware/DataSanitiser")
const responses = require("../responses.json")
const crypto = require("crypto")
const User = require("../models/User")
const db = require("../db/DynamoDbDatabase")
const Credential = require("../models/Credential")

route.get("/", async (req, res) => {
    try {

        const userId = req.body.userId
        if(!userId) return res.status(responses.statusCodes.badReq).json({message: responses.messages.userIdRequired})
        
        const user = new User({docClient: db.getDynamoDocClient()})
        const foundUser = await user.readById(userId)

        if(!foundUser) return res.status(responses.statusCodes.badReq).json({message: responses.messages.userNotFound})

        const newCredential = new Credential({docClient: db.getDynamoDocClient()})
        const allCredentials = await newCredential.readAll(userId)

        res.status(responses.statusCodes.ok).json(allCredentials)
    }
    catch {
        res.status(responses.statusCodes.internalServerError).json({message: responses.messages.internalServerError})
    }
})

// TODO: Implement get credential details by ID
route.get("/:id", (req, res) => {
    res.send("Hello " + req.params.id)
})

route.post("/", dataSantiser.sanitise(), async (req, res) => {
    const reqBody = req.body
    const id = crypto.randomUUID()

    const credentials = {
        id: id,
        userId: reqBody.userId,
        platform: reqBody.platform,
        email: reqBody.email,
        username: reqBody.username,
        password: reqBody.password,
        memorableInfo: reqBody.memorableInfo
    }

    if(credentials.memorableInfo) {
        credentials.memorableInfo = JSON.parse(credentials.memorableInfo.replaceAll("&#x27;", "\""))
    }

    if(!credentials.userId) return res.status(responses.statusCodes.badReq).json({message: responses.messages.userIdRequired})
    if(!credentials.platform) return res.status(responses.statusCodes.badReq).json({message: responses.messages.platformRequired})
    if(!credentials.password) return res.status(responses.statusCodes.badReq).json({message: responses.messages.passwordRequired})

    const user = new User({docClient: db.getDynamoDocClient()})
    const foundUser = await user.readById(credentials.userId)

    if(!foundUser) return res.status(responses.statusCodes.badReq).json({message: responses.messages.userNotFound})

    const newCredential = new Credential({docClient: db.getDynamoDocClient()})
    newCredential.setCredential({
        id: credentials.id,
        userId: credentials.userId,
        platform: credentials.platform,
        email: credentials.email,
        username: credentials.username,
        password: credentials.password,
        memorableInfo: credentials.memorableInfo
    })

    const response = await newCredential.create()

    if(response.error) res.status(responses.statusCodes.internalServerError).json({error: response.error})

    res.status(responses.statusCodes.created).json(response.credential)
})

module.exports = route