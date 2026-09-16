import { Router } from 'express'
import { MilkDelivery, Farmer, Operator, User, MilkQualityTest } from '../models.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role
    const userId = req.user?.user_id

    const where = {}
    if (userRole === 'operator') {
      const op = await Operator.findOne({ where: { user_id: userId } })
      if (op) {
        where.operator_id = op.operator_id
      } else {
        where.operator_id = userId
      }
    }

    let deliveries
    try {
      deliveries = await MilkDelivery.findAll({
        where,
        include: [
          {
            model: Farmer,
            as: 'farmer',
            attributes: ['farmer_id', 'farmer_code', 'location'],
            include: [{ model: User, as: 'user', attributes: ['full_name'] }]
          },
          { model: Operator, as: 'operator', attributes: ['operator_id', 'operator_code'] }
        ]
      })
    } catch (err) {
      console.error('Deliveries query failed, retrying without associations:', err.message || err)
      deliveries = await MilkDelivery.findAll({
        where,
        attributes: ['delivery_id', 'delivery_time', 'quantity_kg', 'status', 'payment_status', 'farmer_id', 'operator_id', 'delivery_person', 'unit_price', 'total_cost', 'delivery_date', 'delivery_time']
      })
    }

    res.json(deliveries)
  } catch (err) {
    console.error('Deliveries endpoint error:', err)
    res.status(500).json({ message: 'Failed to load deliveries' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { farmer_id, operator_id, delivery_person, quantity_kg, unit_price, delivery_date, delivery_time } = req.body

    const total_cost = quantity_kg * unit_price

    let resolvedOperatorId = operator_id
    if (resolvedOperatorId) {
      const op = await Operator.findOne({ where: { operator_id: resolvedOperatorId } })
      if (!op) {
        const byUser = await Operator.findOne({ where: { user_id: resolvedOperatorId } })
        if (byUser) resolvedOperatorId = byUser.operator_id
      }
    }

    const delivery = await MilkDelivery.create({ farmer_id, operator_id: resolvedOperatorId, quantity_kg, unit_price, total_cost, delivery_person, delivery_date, delivery_time })
    res.status(201).json(delivery)
  } catch (error) {
    console.error('Create delivery error:', error)
    res.status(400).json({ message: error.message || 'Failed to record delivery' })
  }
})

router.put('/:id/status', async (req, res) => {
  const { status, unit_price, total_cost, payment_status } = req.body
  const delivery = await MilkDelivery.findByPk(req.params.id)
  if (!delivery) return res.status(404).json({ message: 'Delivery not found' })
  if (typeof status !== 'undefined') delivery.status = status
  if (typeof unit_price !== 'undefined') delivery.unit_price = unit_price
  if (typeof total_cost !== 'undefined') delivery.total_cost = total_cost
  if (typeof payment_status !== 'undefined') delivery.payment_status = payment_status
  await delivery.save()
  res.json(delivery)
})

router.post('/bulk-delete', async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'No IDs provided' })
  await MilkDelivery.destroy({ where: { delivery_id: ids } })
  res.json({ message: 'Deleted successfully' })
})

export default router