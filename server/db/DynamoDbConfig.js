require("dotenv").config({ path: "./.env" })

class DynamoDbConfig {

    #AWS
    #accessKeyId
    #secretAccessKey
    #ddb

    constructor({accessKeyId, secretAccessKey}) {

        if(this.constructor === DynamoDbConfig) {
            throw new Error("Abstract classes can't be instantiated.")
        }

        this.#AWS = require("aws-sdk")

        this.#accessKeyId = accessKeyId
        this.#secretAccessKey = secretAccessKey

        this.#awsConfig()

        this.#ddb = new this.#AWS.DynamoDB()
    }

    #awsConfig() {

        this.#AWS.config.update({
            region: "localhost",
            endpoint: "http://localhost:8000",
            accessKeyId: this.#accessKeyId,
            secretAccessKey: this.#secretAccessKey
        })
    }

    createTable(schema) {

        this.#ddb.listTables({}, (err, data) => {
            if(data.TableNames.includes(schema.TableName)) return

            this.#ddb.createTable(schema, (err, data) => {
                console.log(`${schema.TableName} created successfully`)
            })
        })
    }

    getDdb() {
        return this.#ddb
    }

    getAws() {
        return this.#AWS
    }
}

module.exports = DynamoDbConfig
