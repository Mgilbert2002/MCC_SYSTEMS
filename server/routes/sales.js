import { Router } from 'express'
import { Sale, Product, Operator, MilkTank, MilkDelivery } from '../models.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const calculateTankQuantity = async () => {
  const acceptedDeliveries = await MilkDelivery.sum('quantity_kg', { where: { status: 'accepted' } }).catch(() => 0)

  const allSales = await Sale.findAll().catch(() => [])
  let sold = 0
  for (const sale of allSales) {
    const prod = await Product.findByPk(sale.product_id).catch(() => null)
    if (prod && prod.unit === 'L') {
      sold += Number(sale.quantity || 0)
    }
  }

  return Math.max(0, Number(acceptedDeliveries || 0) - sold)
}

router.get('/', authMiddleware, async (req, res) => {
  const sales = await Sale.findAll({
    include: [{ model: Product, as: 'product' }, { model: Operator, as: 'operator' }]
  })
  res.json(sales)
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product_id, operator_id, client_name, quantity, unit_price, payment_status, sale_date } = req.body
    const product = await Product.findByPk(product_id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const saleQuantity = Number(quantity)
    if (!saleQuantity || saleQuantity <= 0) return res.status(400).json({ message: 'Quantity must be greater than zero' })
    const submittedUnitPrice = Number(unit_price)
    if (!submittedUnitPrice || submittedUnitPrice <= 0) return res.status(400).json({ message: 'Unit price must be greater than zero' })
    if (!operator_id) return res.status(400).json({ message: 'Operator ID is required' })

    let resolvedOperatorId = operator_id
    const op = await Operator.findOne({ where: { operator_id: resolvedOperatorId } })
    if (!op) {
      const byUser = await Operator.findOne({ where: { user_id: resolvedOperatorId } })
      if (byUser) {
        resolvedOperatorId = byUser.operator_id
      } else {
        return res.status(400).json({ message: 'Operator not found' })
      }
    }

    const total_cost = saleQuantity * submittedUnitPrice
    const currentTankQuantity = product.unit === 'L' ? await calculateTankQuantity() : 0
    if (product.unit === 'L' && saleQuantity > currentTankQuantity) {
      return res.status(400).json({ message: 'Insufficient milk in tank' })
    }

    const sale = await Sale.create({
      product_id,
      operator_id: resolvedOperatorId,
      client_name,
      quantity: saleQuantity,
      unit_price: submittedUnitPrice,
      total_cost,
      payment_status,
      sale_date
    })

    if (product.unit === 'L') {
      let tank = await MilkTank.findOne()
      if (!tank) tank = await MilkTank.create({ current_quantity: 0 })
      tank.current_quantity = Math.max(0, currentTankQuantity - saleQuantity)
      tank.last_updated = new Date()
      await tank.save()

      const tankData = {
        current_quantity: Number(tank.current_quantity),
        capacity: 15000,
        percentage: Number(tank.current_quantity) > 0 ? Math.round((Number(tank.current_quantity) / 15000) * 10000) / 100 : 0
      }
      return res.status(201).json({ sale, tank: tankData })
    }

    res.status(201).json({ sale })
  } catch (error) {
    console.error('Create sale error:', error)
    res.status(400).json({ message: error.message || 'Failed to record sale' })
  }
})

export default router