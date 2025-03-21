const { ROLES } = require('../config/constants');

exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userId.role)) {
      return res.status(403).json({ message: 'Forbidden access' });
    }
    next();
  };
};
