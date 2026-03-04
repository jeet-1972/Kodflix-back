const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserByEmailOrUsername, createUser } = require('../models/userModel');

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  );
}

function sendAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function signup(req, res) {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      username,
      email,
      phone: phone || null,
      passwordHash,
      role: 'user',
    });

    return res.status(201).json({
      message: 'Signup successful. Please sign in to continue.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Signup error', err);

    // Handle duplicate email explicitly so the client gets a clear message
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists.' });
    }

    return res.status(500).json({
      message: 'An error occurred during signup.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await findUserByEmailOrUsername(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);
    sendAuthCookie(res, token);

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'An error occurred during login.' });
  }
}

function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  return res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      username: req.user.username,
    },
  });
}

function logout(req, res) {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
}

module.exports = {
  signup,
  login,
  me,
  logout,
};

