const DynamoDbConfig = require("./DynamoDbConfig")
const tableSchema = require("./tablesSchema.json")
require("dotenv").config({ path: "./.env" })

class DynamoDbDatabase extends DynamoDbConfig {

    #AWS
    #docClient

    constructor({region, endpoint, accessKeyId, secretAccessKey, tableSchemas}) {
        super({region, endpoint, accessKeyId, secretAccessKey})

        if(DynamoDbDatabase.instance === null) {
            tableSchemas.forEach((schema) => {
                super.createTable(schema)
            })

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

const region = process.env.AWS_REGION
const endpoint = process.env.AWS_ENDPOINT
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const tableSchemas = [tableSchema.usersTable]

db = new DynamoDbDatabase({region, endpoint, accessKeyId, secretAccessKey, tableSchemas})
Object.freeze(db)
module.exports = db
