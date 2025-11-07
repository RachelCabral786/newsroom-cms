import pkg from 'jsonwebtoken';
const { sign } = pkg;

const generateToken = (userId) => {
  return sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export default generateToken;