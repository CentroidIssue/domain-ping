const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./data/linker.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});


class Database{
    constructor(){

    }
    getData() {
        return new Promise((resolve, reject) => {
            let ret = [];
            db.each(`SELECT * FROM linker`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                ret.push(row);
            }, (err, count) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    resolve(ret);
                }
            });
        });
    }

    getDataById(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM linker WHERE id = ?`, id, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    updateData(id, value) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE linker SET value = ? WHERE id = ?`, [value, id], (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve();
            });
        });
    }

    updateLastPost(id) {
        return new Promise(async (resolve, reject) => {
            const timestamp = new Date().getTime();
            db.run(`UPDATE linker SET previous_post = last_post, last_post = ? WHERE id = ?`, [timestamp, id], (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve();
            });
        });
    }

    deleteData(id) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM linker WHERE id = ?`, id, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve();
            });
        });
    }

    insertData(id, value) {
        return new Promise(async (resolve, reject) => {
            const timestamp = await new Date().getTime();
            db.run(`INSERT INTO linker(id, value, last_post, previous_post) VALUES(?, ?, ?, ?)`, [id, value, timestamp, timestamp], (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve();
            });
        });
    }

    close(){
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Database connection closed.');
        });
    }
}

module.exports = {
    Database
}