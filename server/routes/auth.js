import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { User, Farmer, Operator, Manager } from '../models.js'
import upload from '../upload.js'

const router = Router()

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
    
    let userData = null
    if (user.role === 'farmer') userData = await Farmer.findOne({ where: { user_id: user.user_id } })
    if (user.role === 'operator') userData = await Operator.findOne({ where: { user_id: user.user_id } })
    if (user.role === 'manager') userData = await Manager.findOne({ where: { user_id: user.user_id } })

    res.json({ token, user, userData })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/register', upload.single('profile_image'), [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').notEmpty(),
  body('role').isIn(['manager', 'operator', 'farmer'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password, full_name, role, phone } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const profileImage = req.file ? `/uploads/${req.file.filename}` : null

    const user = await User.create({ 
      email, 
      password: hashedPassword, 
      full_name, 
      role, 
      phone,
      profile_image: profileImage
    })
    
    if (role === 'farmer') await Farmer.create({ user_id: user.user_id, farmer_code: `FARM${user.user_id}` })
    if (role === 'operator') await Operator.create({ user_id: user.user_id, operator_code: `OP${user.user_id}` })
    if (role === 'manager') await Manager.create({ user_id: user.user_id })
    
    res.status(201).json({ message: 'User created', user })
  } catch (error) {
    console.error('Registration error:', error)
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        errors: error.errors.map(err => ({
          msg: err.message,
          param: err.path,
          value: err.value
        }))
      })
    }
    res.status(500).json({ message: 'Registration failed' })
  }
})

router.put('/profile', upload.single('profile_image'), [
  body('user_id').isInt(),
  body('full_name').notEmpty().isLength({ max: 100 }),
  body('email').isEmail().isLength({ max: 100 }),
  body('phone').optional().isLength({ max: 20 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { user_id, full_name, email, phone } = req.body

    const user = await User.findByPk(user_id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (email !== user.email) {
      const existing = await User.findOne({ where: { email } })
      if (existing) return res.status(400).json({ message: 'Email already in use' })
    }

    user.full_name = full_name
    user.email = email
    user.phone = phone || null
    if (req.file) {
      user.profile_image = `/uploads/${req.file.filename}`
    }
    await user.save()

    const updatedUser = user.toJSON()
    let updatedUserData = null
    if (updatedUser.role === 'operator') {
      updatedUserData = await Operator.findOne({ where: { user_id: updatedUser.user_id }, include: [{ model: User, as: 'user', attributes: ['full_name', 'email', 'phone'] }] })
    }
    if (updatedUser.role === 'farmer') {
      updatedUserData = await Farmer.findOne({ where: { user_id: updatedUser.user_id } })
    }
    if (updatedUser.role === 'manager') {
      updatedUserData = await Manager.findOne({ where: { user_id: updatedUser.user_id } })
    }

    res.json({ message: 'Profile updated', user: updatedUser, userData: updatedUserData })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const user = await User.findByPk(decoded.user_id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    let userData = null
    if (user.role === 'operator') {
      userData = await Operator.findOne({ where: { user_id: user.user_id } })
    }
    if (user.role === 'farmer') {
      userData = await Farmer.findOne({ where: { user_id: user.user_id } })
    }
    if (user.role === 'manager') {
      userData = await Manager.findOne({ where: { user_id: user.user_id } })
    }

    res.json({ user, userData })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
