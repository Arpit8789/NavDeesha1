const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
