const bcrypt = require('bcryptjs')
const express = require('express');
const app = express();
const port = 3000;
const config = require('./config.json');

app.use(express.json())

class Database {
    constructor(dbFilePath) {
        this.db = new sqlite3.Database(dbFilePath);
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('Error running sql ' + sql);
                    console.error(err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    console.error('Error running sql: ' + sql);
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Error running sql: ' + sql);
                    console.error(err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing the database connection.');
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

const sqlite3 = require('sqlite3').verbose();
const db = new Database('./db/hatch.db')

app.post('/authentication',async (req, res) => {
    const username = req.body.username;
    let password = bcrypt.hashSync(req.body.password)

    console.log(username, password)

    // Gets a user from the database that matches the username or password, or returns nothing if there is no match
    const user = await db.all('select * from users where username = ? and password = ?', [username, password])
        .catch(() => res.status(500))

    console.log("data:", user)

    // Checks if a user with that username and password exists
    // Checks if the database returns a user, indicating that the username and password were correct
    if (user.length === 0) {
        res.send({'success': false, 'reason': 'Invalid Credentials'})
    }

    // Creates the token
    let token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log(token)

    // Add the token to the database. Catches errors thrown and responds with 500 before the token is sent.
    await db.run('insert into apikeys values (?, ?, ?)', [token, token, user[0].id])
        .catch(() => res.sendStatus(500))

    // Return the generated token
    res.send(token)
})

app.post('/data-backup', (req, res) => {
    // Get synthetic data from online model

})

app.post('/data', (req, res) => {
    // Get synthetic data from local model

})

// Sets up the debug endpoints
if (config.debug) {
    // Manually adds users to the database
    // Primarily used to make sure password hashing is functional
    app.post('/setup', async (req, res) => {
        const username = req.body.username
        const password = bcrypt.hashSync(req.body.password)
        const id = req.body.id

        // Adds the user to the database
        await db.run(`insert into users(id, username, password) values (?, ?, ?)`, [id, username, password])
            .catch(() => res.sendStatus(500))

        // Return success
        res.sendStatus(200)
    })

    // Gets all users from the database
    // Primarily used to check password hashes to find issues causing authentication to fail
    app.get('/get-all', async (req, res) => {
        // Get all users from the database
        const user_rows = await db.all("select * from users", [])
            .catch(() => res.sendStatus(500))

        const apikeys_rows = await db.all('select * from apikeys', [])
            .catch(() => res.sendStatus(500))

        // Return the users' data
        res.send([user_rows, apikeys_rows])
    })
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})
