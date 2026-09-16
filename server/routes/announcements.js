import { Router } from 'express'
import { Announcement, Manager } from '../models.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  const userRole = req.user?.role
  const where = {}
  if (userRole && userRole !== 'manager') {
    where.target_role = userRole
  }

  const announcements = await Announcement.findAll({
    where,
    include: [{ model: Manager, as: 'creator' }]
  })
  res.json(announcements)
})

router.post('/', async (req, res) => {
  const { title, message, target_role, created_by } = req.body
  const announcement = await Announcement.create({ title, message, target_role, created_by })
  res.status(201).json(announcement)
})

export default router