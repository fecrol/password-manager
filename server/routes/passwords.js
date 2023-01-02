const express = require("express")
const route = express.Router()
const dataSantiser = require("../middleware/DataSanitiser")

const passwords = []

route.get("/", (req, res) => {
    res.send(passwords[0])
})

route.post("/", dataSantiser.sanitise(), (req, res) => {
    const password = req.body.password
    passwords.push(password)
    res.status(201)
    res.json({message: "success", password: password})
})

module.exports = route