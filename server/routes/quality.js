import { Router } from 'express'
import { MilkQualityTest, MilkDelivery, Operator } from '../models.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  const tests = await MilkQualityTest.findAll({
    include: [{ model: MilkDelivery, as: 'delivery' }]
  })
  res.json(tests)
})

router.get('/:deliveryId', authMiddleware, async (req, res) => {
  const test = await MilkQualityTest.findOne({ where: { delivery_id: req.params.deliveryId } })
  res.json(test)
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { delivery_id, appearance, smell, taste, temperature, lactometer_reading, acidity_test, antibiotic_test } = req.body

    const operator = await Operator.findOne({ where: { user_id: req.user.user_id } })
    const tested_by = operator ? operator.operator_id : req.user.user_id

    const calculateSpecificGravity = (lactometerReading, temperature) => {
    const L = Number(lactometerReading) || 0
    const T = Number(temperature) || 0
    const base = 1 + L / 1000
    if (T > 15.5) return Number((base + 0.2 * (T - 15.5)).toFixed(3))
    if (T < 15.5) return Number((base - 0.2 * (15.5 - T)).toFixed(3))
    return Number(base.toFixed(3))
  }

  const allTestsPass = (appearance, smell, taste, acidity_test, antibiotic_test, temp, lactometer) => {
    const gravity = calculateSpecificGravity(lactometer, temp)
    return (
      appearance === 'good' &&
      smell === 'good' &&
      taste === 'good' &&
      acidity_test === 'normal' &&
      antibiotic_test === 'negative' &&
      gravity >= 1.028 && gravity <= 1.033
    )
  }

  const organoleptic_result = allTestsPass(appearance, smell, taste, acidity_test, antibiotic_test, temperature, lactometer_reading) ? 'pass' : 'fail'

  const test = await MilkQualityTest.create({
    delivery_id, tested_by, appearance, smell, taste, temperature, lactometer_reading, acidity_test, antibiotic_test, organoleptic_result
  })

  res.status(201).json(test)
  } catch (err) {
    console.error('Quality save error:', err)
    res.status(500).json({ message: err.message || 'Failed to save test results' })
  }
})

router.put('/:testId', authMiddleware, async (req, res) => {
  const { testId } = req.params
  const { specific_gravity } = req.body
  const test = await MilkQualityTest.findByPk(testId)
  if (!test) return res.status(404).json({ message: 'Test not found' })
  if (typeof specific_gravity !== 'undefined') {
    test.specific_gravity = specific_gravity
  }
  await test.save()
  res.json(test)
})

router.put('/:testId/decision', authMiddleware, async (req, res) => {
  const { testId } = req.params
  const { final_decision } = req.body
  const test = await MilkQualityTest.findByPk(testId)
  if (!test) return res.status(404).json({ message: 'Test not found' })
  test.final_decision = final_decision
  await test.save()

  const delivery = await MilkDelivery.findByPk(test.delivery_id)
  if (delivery) {
    delivery.status = final_decision
    await delivery.save()
  }
  res.json(test)
})

export default router
