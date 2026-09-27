const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function sanitize(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  }
}

async function register(req, res, next) {
  try {
    const { fullName, email, password, confirmPassword, phoneNumber } = req.body

    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({
      name: fullName,
      email: email.toLowerCase(),
      password: hashed,
      phone: phoneNumber,
      role: 'Farmer / Operator',
    })

    const token = signToken(user._id)
    res.status(201).json({ token, user: sanitize(user) })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid login credentials' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid login credentials' })
    }

    const token = signToken(user._id)
    res.json({ token, user: sanitize(user) })
  } catch (err) {
    next(err)
  }
}

async function logout(req, res) {
  // JWTs are stateless; the client simply discards the token.
  res.json({ message: 'Logged out' })
}

async function getMe(req, res) {
  res.json(sanitize(req.user))
}

async function updateMe(req, res, next) {
  try {
    const { name, email, phone } = req.body
    if (name) req.user.name = name
    if (email) req.user.email = email.toLowerCase()
    if (phone) req.user.phone = phone
    await req.user.save()
    res.json(sanitize(req.user))
  } catch (err) {
    next(err)
  }
}

async function forgotPassword(req, res) {
  // Placeholder: in production this generates a reset token and emails it.
  res.json({ message: 'If that email exists, password reset instructions have been sent.' })
}

module.exports = { register, login, logout, getMe, updateMe, forgotPassword }
