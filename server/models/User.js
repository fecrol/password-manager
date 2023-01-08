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
        if(response.Item.password) delete response.Item.password
        return response.Item
    }

    async checkIfUserExists(email) {

        const users = await this.#readAll()
        const user = users.find(user => {
            return user.email === email
        })

        return user ? true : false
    }

    async #readAll() {
        const params = {
            TableName: "USERS",
        }

        const response = await this.#docClient.scan(params).promise()
        return response.Items
    }

    getUser() {
        return {id: this.#id, email: this.#email, dateJoined: this.#dateJoined, blocked: this.#blocked}
    }

    setUser({id, email, password, dateJoined, blocked}) {
        this.setId(id)
        this.setEmail(email)
        this.setPassword(password)
        this.setDateJoined(dateJoined)
        this.setBlocked(blocked)
    }

    getId() {
        return this.#id
    }

    setId(id) {
        this.#id = id
    }

    getEmail() {
        return this.#email
    }

    setEmail(email) {
        this.#email = email
    }

    setPassword(password) {
        this.#password = password 
    }

    getDateJoined() {
        return this.#dateJoined
    }

    setDateJoined(dateJoined) {
        this.#dateJoined = dateJoined
    }

    getBlocked() {
        return this.#blocked
    }

    setBlocked(blocked) {
        this.#blocked = blocked
    }
}

module.exports = User
