import { Router } from 'express'
import { MilkTank, MilkDelivery, MilkQualityTest, Sale, Product } from '../models.js'

const DEFAULT_CAPACITY = 15000

const calculateTankQuantity = async () => {
  const deliveries = await MilkDelivery.findAll({
    where: { status: 'accepted' },
    include: [{ model: MilkQualityTest, as: 'qualityTest' }]
  }).catch(() => [])

  const calculateSpecificGravity = (lactometerReading, temperature) => {
    const L = Number(lactometerReading) || 0
    const T = Number(temperature) || 0
    const base = 1 + L / 1000
    if (T > 15.5) return Number((base + 0.2 * (T - 15.5)).toFixed(3))
    if (T < 15.5) return Number((base - 0.2 * (15.5 - T)).toFixed(3))
    return Number(base.toFixed(3))
  }

  const allTestsPass = (test) => {
    if (!test) return false
    const gravity = calculateSpecificGravity(test.lactometer_reading, test.temperature)
    return (
      test.appearance === 'good' &&
      test.smell === 'good' &&
      test.taste === 'good' &&
      test.acidity_test === 'normal' &&
      test.antibiotic_test === 'negative' &&
      gravity >= 1.028 && gravity <= 1.033 &&
      test.organoleptic_result === 'pass'
    )
  }

  const acceptedQuantity = deliveries.reduce((sum, d) => {
    const test = d.qualityTest
    if (!test) return sum
    if (test.final_decision !== 'accepted') return sum
    if (!allTestsPass(test)) return sum
    return sum + (Number(d.quantity_kg) || 0)
  }, 0)

  const allSales = await Sale.findAll().catch(() => [])
  let sold = 0
  for (const sale of allSales) {
    const prod = await Product.findByPk(sale.product_id).catch(() => null)
    if (prod && prod.unit === 'L') {
      sold += Number(sale.quantity || 0)
    }
  }

  return Math.max(0, acceptedQuantity - sold)
}

const formatTank = tank => {
  const current_quantity = Number(tank?.current_quantity || 0)
  const capacity = Number(tank?.capacity || DEFAULT_CAPACITY)
  const percentage = capacity > 0 ? Math.min(100, Math.max(0, (current_quantity / capacity) * 100)) : 0
  const status = percentage >= 90 ? 'critical' : percentage >= 75 ? 'high' : percentage >= 25 ? 'normal' : 'low'

  return {
    tank_id: tank?.tank_id || 1,
    current_quantity,
    capacity,
    percentage: Math.round(percentage * 100) / 100,
    status,
    last_updated: tank?.last_updated
  }
}

const router = Router()

router.get('/', async (req, res) => {
  const calculatedQuantity = await calculateTankQuantity()
  let tank = await MilkTank.findOne()

  if (!tank) {
    tank = await MilkTank.create({ current_quantity: calculatedQuantity })
  } else if (Number(tank.current_quantity) !== calculatedQuantity) {
    tank.current_quantity = calculatedQuantity
    await tank.save()
  }

  res.json(formatTank(tank))
})

router.put('/', async (req, res) => {
  const { quantity, capacity } = req.body
  let tank = await MilkTank.findOne()
  if (!tank) tank = await MilkTank.create({ current_quantity: 0 })

  if (typeof quantity === 'number' || typeof quantity === 'string') {
    tank.current_quantity = Math.max(0, Number(quantity))
  }
  if (capacity) {
    tank.capacity = Number(capacity)
  }
  tank.last_updated = new Date()
  await tank.save()
  res.json(formatTank(tank))
})

export default router