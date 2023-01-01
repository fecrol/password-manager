const express = require("express")

if(process.env.NODE_ENV !== "production") require("dotenv").config({ path: "../.env" })

const app = express()
const PORT = process.env.PORT || process.env.EXPRESS_PORT

app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.listen(PORT, () => {
    console.log(`Currently listening on port ${PORT}`)
})
