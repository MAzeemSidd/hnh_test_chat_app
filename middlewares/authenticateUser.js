const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
    
     // Unauthorized - If no token available
    if (!token) return res.status(401).json({ message: 'Unauthorized User' });

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        // Forbidden - If jwt verification give error
        console.log('jwt.verify--ERROR-->', err?.message)
        if (err) return res.status(401).json({ message: err?.message });
        
        req.user = user; // Attach user data to request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateUser;