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

module.exports = route