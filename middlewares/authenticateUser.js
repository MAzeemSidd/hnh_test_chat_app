const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
    
     // Unauthorized - If no token available
    if (!token) return res.status(401).json({ message: 'User is not authorized' });

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        // Forbidden - If jwt verification give error
        if (err) return res.status(403).json({ message: 'User is unauthorized' });
        
        req.user = user; // Attach user data to request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateUser;