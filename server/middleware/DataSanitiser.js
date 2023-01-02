const { check } = require("express-validator")

class DataSanitiser {

    constructor() {

        if(DataSanitiser.instance === null) {
            DataSanitiser.instance = this
        }

        return DataSanitiser.instance
    }

    sanitise() {
        return check("*").trim().escape()
    }
}

const dataSantiser = new DataSanitiser()
Object.freeze(dataSantiser)
module.exports = dataSantiser