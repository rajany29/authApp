const jwt = require('jsonwebtoken');

const sendToken = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '7d',
    });
  
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only over HTTPS
      sameSite: 'None', 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  
    res.status(statusCode)
      .cookie('token', token, cookieOptions)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  };
  
 module.exports = sendToken;
  