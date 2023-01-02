const express = require("express")
const passwordsRoute = require("./routes/passwords")

if(process.env.NODE_ENV !== "production") require("dotenv").config({ path: "../.env" })

const app = express()
const PORT = process.env.PORT || process.env.EXPRESS_PORT

app.use(express.json())
app.use("/passwords", passwordsRoute)

app.listen(PORT, () => {
    console.log(`Currently listening on port ${PORT}`)
})
