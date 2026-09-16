import { Router } from 'express'
import { Op } from 'sequelize'
import { Message, User } from '../models.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user?.user_id
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { sender_id: userId },
        { receiver_id: userId }
      ]
    },
    include: [{ model: User, as: 'sender' }, { model: User, as: 'receiver' }]
  })
  res.json(messages)
})

router.post('/', async (req, res) => {
  const { sender_id, receiver_id, message } = req.body
  const msg = await Message.create({ sender_id, receiver_id, message })
  res.status(201).json(msg)
})

router.put('/:id/read', async (req, res) => {
  const msg = await Message.findByPk(req.params.id)
  if (!msg) return res.status(404).json({ message: 'Message not found' })
  msg.status = 'seen'
  await msg.save()
  res.json(msg)
})

export default router