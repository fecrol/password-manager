class User {

    #docClient
    #id
    #email
    #password
    #dateJoined
    #blocked
    
    constructor({docClient}) {
        this.#docClient = docClient

        this.#id
        this.#email
        this.#password
        this.#dateJoined
        this.#blocked
    }

    async create() {
        const params = {
            TableName: "USERS",
            Item: {
                user_id: this.#id,
                email: this.#email,
                password: this.#password,
                date_joined: this.#dateJoined,
                blocked: this.#blocked
            }
        }

        let response

        await this.#docClient.put(params, (err) => {
            if(err) response = {error: err}
            else response = {user: this.getUser()}
        }).promise()

        return response
    }

    async readById(id) {
        const params = {
            TableName: "USERS",
            Key: {user_id: id}
        }

        const response = await this.#docClient.get(params).promise()
        if(response.Item && response.Item.password) delete response.Item.password
        return response.Item
    }

    async readByEmail(email) {

        const users = await this.readAll()
        const user = users.find(user => {
            return user.email === email
        })

        return user
    }

    async readAll() {
        const params = {
            TableName: "USERS",
        }

        const response = await this.#docClient.scan(params).promise()
        response.Items.forEach((user) => {
            if(user.password) delete user.password
        })
        return response.Items
    }

    getUser() {
        return {id: this.#id, email: this.#email, dateJoined: this.#dateJoined, blocked: this.#blocked}
    }

    setUser({id, email, password, dateJoined, blocked}) {
        this.#id = id
        this.#email = email
        this.#password = password
        this.#dateJoined = dateJoined
        this.#blocked = blocked
    }
}

module.exports = User
