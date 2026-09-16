import { Router } from 'express'
import { sequelize } from '../db.js'
import { User, Farmer, MilkTank, MilkDelivery, Sale, Payment, Product } from '../models.js'
import { Op, fn, col, literal } from 'sequelize'

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

router.get('/', async (req, res) => {
    try {
      const farmerCount = await User.count({ where: { role: 'farmer' } }).catch(() => 0)
      const todayDeliveries = await MilkDelivery.findOne({
        attributes: [[fn('SUM', col('quantity_kg')), 'total']],
        where: literal(`DATE(delivery_date) = CURDATE()`)
      }).catch(() => null)
      const todaySales = await Sale.findOne({
        attributes: [[fn('SUM', col('total_cost')), 'total']],
        where: literal(`DATE(sale_date) = CURDATE()`)
      }).catch(() => null)
      const unpaidDeliveries = await MilkDelivery.findAll({
        attributes: ['delivery_id', 'farmer_id'],
        where: { status: 'accepted', payment_status: 'unpaid' }
      }).catch(() => [])
      const partialPayments = await Payment.findAll({
        attributes: ['delivery_id'],
        where: { unpaid_balance: { [Op.gt]: 0 } },
        include: [{
          model: MilkDelivery,
          as: 'delivery',
          attributes: ['delivery_id', 'status', 'farmer_id', 'payment_status'],
          required: true,
          where: { status: 'accepted' }
        }]
      }).catch(() => [])
      const activePartialPayments = partialPayments.filter(payment => payment.delivery?.payment_status !== 'paid')
      const unpaidSales = await Sale.findAll({
        attributes: ['sale_id', 'client_name'],
        where: { payment_status: 'unpaid' }
      }).catch(() => [])
      const pendingPaymentIds = new Set()
      const clientsNotPayingIds = new Set()
      const farmerClientKeys = new Set()

      unpaidDeliveries.forEach(delivery => {
        pendingPaymentIds.add(delivery.delivery_id)
        farmerClientKeys.add(`farmer:${delivery.farmer_id}`)
        clientsNotPayingIds.add(`farmer:${delivery.farmer_id}`)
      })

      activePartialPayments.forEach(payment => {
        const farmerId = payment.delivery?.farmer_id
        if (farmerId) {
          farmerClientKeys.add(`farmer:${farmerId}`)
          clientsNotPayingIds.add(`farmer:${farmerId}`)
        }
        pendingPaymentIds.add(payment.delivery_id)
      })

      unpaidSales.forEach(sale => {
        const clientName = sale.client_name || `Sale #${sale.sale_id}`
        if (!farmerClientKeys.has(clientName)) {
          clientsNotPayingIds.add(`sale-client:${clientName}`)
        }
      })

      const pendingPayments = pendingPaymentIds.size
      const clientsNotPaying = clientsNotPayingIds.size
      const tank = await MilkTank.findOne({ where: { tank_id: 1 } }).catch(() => null)
      const tankQuantity = tank ? Number(tank.current_quantity) : await calculateTankQuantity()

      res.json({
        totalFarmers: farmerCount || 0,
        milkCollectedToday: Number(todayDeliveries?.getDataValue('total') || 0),
        salesToday: Number(todaySales?.getDataValue('total') || 0),
        paymentsPending: pendingPayments || 0,
        clientsNotPaying: clientsNotPaying || 0,
        tankCapacity: tankQuantity || 0,
        tankLastUpdated: tank?.last_updated || null,
        tankCapacityLiters: tank?.capacity || 15000
      })
    } catch (err) {
      console.error('Stats error:', err)
      res.json({ 
        totalFarmers: 0, 
        milkCollectedToday: 0, 
        salesToday: 0, 
        paymentsPending: 0, 
        clientsNotPaying: 0, 
        tankCapacity: 0,
        tankLastUpdated: null,
        tankCapacityLiters: 15000
      })
    }
  })

export default router