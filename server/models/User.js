class User {

    #docClient
    #id
    #email
    #password
    #dateJoined
    #blocked
    
    constructor(docClient) {
        this.#docClient = docClient

        this.#id
        this.#email
        this.#password
        this.#dateJoined
        this.#blocked
    }

    getUser() {
        return {id: this.#id, email: this.#email, dateJoined: this.#dateJoined, blocked: this.#blocked}
    }

    getDoc() {
        return this.#docClient
    }

    create() {
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

        let error
        
        this.#docClient.put(params, (err) => {
            if(err) error = err
        }).promise()

        if(error) return error
        return 0
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
