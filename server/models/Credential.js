class Credential {

    #docClient
    #id
    #userId
    #platform
    #email
    #username
    #password
    #memorableInfo
    
    constructor({docClient}) {
        this.#docClient = docClient
        this.#id
        this.#userId
        this.#platform
        this.#email
        this.#username
        this.#password
        this.#memorableInfo
    }

    async readAll(userId) {
        const params = {
            TableName: "CREDENTIALS",
        }

        const response = await this.#docClient.scan(params).promise()
        return response.Items.filter((credential) => {
            return credential.user_id === userId
        })
    }

    async readById(id) {
        const params = {
            TableName: "CREDENTIALS",
            Key: {credential_id: id}
        }

        const response = await this.#docClient.get(params).promise()
        return response.Item
    }

    async create() {
        const params = {
            TableName: "CREDENTIALS",
            Item: {
                credential_id: this.#id,
                user_id: this.#userId,
                platform: this.#platform,
                email: this.#email,
                username: this.#username,
                password: this.#password,
                memorableInfo: this.#memorableInfo
            }
        }

        let response

        await this.#docClient.put(params, (err) => {
            if(err) response = {error: err}
            else response = {credential: this.getCredential()}
        }).promise()

        return response
    }

    getCredential() {
        return {
            id: this.#id,
            platform: this.#platform,
            email: this.#email,
            username: this.#username,
            password: this.#password,
            memorableInfo: this.#memorableInfo
        }
    }

    setCredential({id, userId, platform, email, username, password, memorableInfo}) {
        this.#id = id
        this.#userId = userId
        this.#platform = platform
        this.#email = email
        this.#username = username
        this.#password = password
        this.#memorableInfo = memorableInfo
    }
}

module.exports = Credential
