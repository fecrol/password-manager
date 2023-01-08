const DynamoDbConfig = require("./DynamoDbConfig")
require("dotenv").config({ path: "./.env" })

class DynamoDbDatabase extends DynamoDbConfig {

    #AWS
    #docClient

    constructor({region, endpoint, accessKeyId, secretAccessKey, tableSchemas}) {
        super({region, endpoint, accessKeyId, secretAccessKey})

        if(DynamoDbDatabase.instance == null) {
            this.#AWS = super.getAws()
            this.#docClient = new this.#AWS.DynamoDB.DocumentClient()

            DynamoDbDatabase.instance = this
        }
        
        return DynamoDbDatabase.instance
    }

    getDynamoDocClient() {
        return this.#docClient
    }
}

const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

db = new DynamoDbDatabase({accessKeyId, secretAccessKey})
Object.freeze(db)
module.exports = db
