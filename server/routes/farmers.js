import { Router } from 'express'
import { Farmer, User } from '../models.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { code } = req.query
    let where = {}
    if (code) {
      where.farmer_code = String(code).trim()
    }
    const farmers = await Farmer.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'full_name', 'email', 'phone']
      }],
      limit: 20
    })
    res.json(farmers)
  } catch (err) {
    const msg = err.message || err
    console.error('Farmers search error details:', msg, err.stack)
    res.status(500).json({ message: 'Farmer lookup failed', detail: String(msg) })
  }
})

export default router
