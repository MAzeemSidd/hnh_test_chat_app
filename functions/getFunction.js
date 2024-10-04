const db = require('./dbConnection');  

function getFunction(query) {
    return new Promise((resolve, reject) => {
        db.query(query, (err, data) => {
            if(err) return reject(err);
            return resolve(data);
        })
    })
}

module.exports = getFunction;