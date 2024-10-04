const db = require('./dbConnection')

function addFunction(query, values) {
    return new Promise((resolve, reject) => {
        db.query(query, [values], (err) => {
            if(err) return reject(err);
            return resolve();
        })
    })
}

module.exports = addFunction;