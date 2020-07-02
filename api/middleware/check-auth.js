const jwt = require('jwt-simple');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // primitive but effective, passport and jwt token strategy were a pain in the back
    const decoded = jwt.decode(token, process.env.JWT_KEY || 'sekret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'unauthorized',
    });
  }
  return null;
};
