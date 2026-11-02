import { Router } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { body, validationResult } from 'express-validator'
import { User, PasswordResetToken } from '../models.js'

const router = Router()

router.post('/forgot-password', [body('email').isEmail()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { email } = req.body
    const user = await User.findOne({ where: { email } })
    // Do not reveal whether email exists
    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await PasswordResetToken.create({ user_id: user.user_id, token, expires_at: expires })
      const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`
      console.log('Password reset link:', link)
      if (process.env.SMTP_HOST) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        })
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@mcc.rw',
          to: email,
          subject: 'Password Reset',
          text: `Reset your password: ${link}`
        })
      }
    }
    res.json({ message: 'If an account exists, a reset link has been sent.' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { token, password } = req.body
    const record = await PasswordResetToken.findOne({ where: { token, used: false } })
    if (!record || new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }
    const user = await User.findByPk(record.user_id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.password = await bcrypt.hash(password, 10)
    await user.save()
    record.used = true
    await record.save()
    res.json({ message: 'Password reset successful' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router