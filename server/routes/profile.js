import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { User } from '../models.js'
import upload from '../upload.js'

const router = Router()

router.put('/', upload.single('profile_image'), [
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

    res.json({ message: 'Profile updated', user })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
