import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
  // Get the user from JWT token and attach it to req object
  const token = req.header('authtoken');
  if (!token) {
    return res.status(401).json({ error: 'Please authenticate using a valid token' });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    console.log('user is', data);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Please authenticate using a valid token' });
  }
};

export default fetchuser;
