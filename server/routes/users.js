const express = require("express")
const route = express.Router()

route.get("/:id", (req, res) => {
    res.send("Users")
})

module.exports = route