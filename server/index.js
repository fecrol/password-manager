const express = require("express")
const credentialssRoute = require("./routes/credentials")
const usersRoute = require("./routes/users")

if(process.env.NODE_ENV !== "production") require("dotenv").config({ path: "../.env" })

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use("/credentials", credentialssRoute)
app.use("/users", usersRoute)

app.listen(PORT, () => {
    console.log(`Currently listening on port ${PORT}`)
})
