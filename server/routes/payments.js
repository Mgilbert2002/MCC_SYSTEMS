import { Router } from 'express'
import { Payment, Farmer, MilkDelivery, User, Operator, Sale } from '../models.js'
import { authMiddleware } from '../middleware/auth.js'
import { Op } from 'sequelize'

const router = Router()

router.get('/', async (req, res) => {
  const payments = await Payment.findAll({
    include: [{ model: Farmer, as: 'farmer' }, { model: MilkDelivery, as: 'delivery' }]
  })
  res.json(payments)
})

const getDeliveryWhereForUser = async (user) => {
  const deliveryWhere = { status: 'accepted' }

  if (user?.role === 'operator') {
    const op = await Operator.findOne({ where: { user_id: user.user_id } })
    deliveryWhere.operator_id = op ? op.operator_id : user.user_id
  }

  return deliveryWhere
}

const getSaleWhereForUser = async (user) => {
  if (user?.role !== 'operator') return {}

  const op = await Operator.findOne({ where: { user_id: user.user_id } })
  return { operator_id: op ? op.operator_id : user.user_id }
}

const getFarmerInclude = () => ({
  model: Farmer,
  as: 'farmer',
  attributes: ['farmer_id', 'farmer_code', 'location'],
  include: [{ model: User, as: 'user', attributes: ['full_name'] }]
})

const getPendingPaymentRecords = async (user) => {
  if (!['manager', 'operator'].includes(user?.role)) {
    const error = new Error('Forbidden')
    error.status = 403
    throw error
  }

  const deliveryWhere = await getDeliveryWhereForUser(user)

  const [unpaidDeliveries, partialPayments] = await Promise.all([
    MilkDelivery.findAll({
      where: { ...deliveryWhere, payment_status: 'unpaid' },
      include: [getFarmerInclude()]
    }),
    Payment.findAll({
      where: { unpaid_balance: { [Op.gt]: 0 } },
      include: [{
        model: MilkDelivery,
        as: 'delivery',
        required: true,
        where: deliveryWhere,
        include: [getFarmerInclude()]
      }]
    })
  ])

  const activePartialPayments = partialPayments.filter(payment => payment.delivery?.payment_status !== 'paid')

  const pendingByDeliveryId = new Map()

  unpaidDeliveries.forEach(delivery => {
    pendingByDeliveryId.set(delivery.delivery_id, {
      payment_id: null,
      farmer: delivery.farmer,
      delivery,
      amount_paid: 0,
      unpaid_balance: Number(delivery.total_cost || 0),
      payment_method: null,
      payment_date: null,
      processed_by: null
    })
  })

  activePartialPayments.forEach(payment => {
    const existing = pendingByDeliveryId.get(payment.delivery_id)
    const next = existing || {
      payment_id: null,
      farmer: payment.delivery?.farmer,
      delivery: payment.delivery,
      amount_paid: 0,
      unpaid_balance: 0,
      payment_method: null,
      payment_date: null,
      processed_by: null
    }

    next.amount_paid = Number(next.amount_paid || 0) + Number(payment.amount_paid || 0)
    next.unpaid_balance = Number(payment.unpaid_balance || 0)
    next.payment_method = payment.payment_method
    next.payment_date = payment.payment_date
    next.processed_by = payment.processed_by
    next.payment_id = next.payment_id || payment.payment_id

    pendingByDeliveryId.set(payment.delivery_id, next)
  })

  return Array.from(pendingByDeliveryId.values())
    .sort((a, b) => new Date(b.delivery.delivery_date) - new Date(a.delivery.delivery_date))
}

const getPendingClients = async (user) => {
  if (!['manager', 'operator'].includes(user?.role)) {
    const error = new Error('Forbidden')
    error.status = 403
    throw error
  }

  const pendingPayments = await getPendingPaymentRecords(user)
  const saleWhere = await getSaleWhereForUser(user)
  const unpaidSales = await Sale.findAll({
    where: { ...saleWhere, payment_status: 'unpaid' }
  })
  const clientsById = new Map()

  const getOrCreateClient = (clientId, clientType, name, code) => {
    const existing = clientsById.get(clientId)
    if (existing) return existing

    const next = {
      client_id: clientId,
      client_type: clientType,
      farmer_id: clientType === 'farmer' ? Number(clientId) : undefined,
      farmer: clientType === 'farmer' ? null : undefined,
      client_name: name,
      deliveries: [],
      sales: [],
      amount_paid: 0,
      unpaid_balance: 0,
      expected_payment_date: null,
      expected_payment_time: null
    }

    clientsById.set(clientId, next)
    return next
  }

  pendingPayments.forEach(payment => {
    const farmerId = payment.farmer?.farmer_id || payment.delivery?.farmer_id
    if (!farmerId) return

    const client = getOrCreateClient(
      `farmer:${farmerId}`,
      'farmer',
      payment.farmer?.user?.full_name || payment.farmer?.farmer_code || `Farmer #${farmerId}`,
      payment.farmer?.farmer_code || null
    )

    client.farmer = payment.farmer || payment.delivery?.farmer
    client.deliveries.push(payment.delivery)
    client.amount_paid += Number(payment.amount_paid || 0)
    client.unpaid_balance += Number(payment.unpaid_balance || 0)
    client.expected_payment_date = client.expected_payment_date || payment.delivery.expected_payment_date || null
    client.expected_payment_time = client.expected_payment_time || payment.delivery.expected_payment_time || null
  })

  unpaidSales.forEach(sale => {
    const saleClientName = sale.client_name || `Sale #${sale.sale_id}`
    const matchingFarmerClient = Array.from(clientsById.values()).find(client => {
      const clientName = client.client_name || client.farmer?.user?.full_name || client.farmer?.farmer_code
      return clientName === saleClientName || client.farmer?.farmer_code === saleClientName
    })

    const client = matchingFarmerClient || getOrCreateClient(`sale:${sale.sale_id}`, 'sale', saleClientName, null)

    client.sales.push({
      sale_id: sale.sale_id,
      client_name: sale.client_name,
      total_cost: sale.total_cost,
      sale_date: sale.sale_date,
      payment_status: sale.payment_status
    })
    client.unpaid_balance += Number(sale.total_cost || 0)
  })

  return Array.from(clientsById.values()).sort((a, b) => {
    const nameA = a.client_name || a.farmer?.user?.full_name || a.farmer?.farmer_code || ''
    const nameB = b.client_name || b.farmer?.user?.full_name || b.farmer?.farmer_code || ''
    return nameA.localeCompare(nameB)
  })
}

router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const pendingPayments = await getPendingPaymentRecords(req.user)
    res.json(pendingPayments)
  } catch (err) {
    console.error('Pending payments endpoint error:', err)
    res.status(err.status || 500).json({ message: err.status === 403 ? 'Forbidden' : 'Failed to load pending payments' })
  }
})

router.get('/pending/clients', authMiddleware, async (req, res) => {
  try {
    const pendingClients = await getPendingClients(req.user)
    res.json(pendingClients)
  } catch (err) {
    console.error('Pending clients endpoint error:', err)
    res.status(err.status || 500).json({ message: err.status === 403 ? 'Forbidden' : 'Failed to load unpaid clients' })
  }
})

router.put('/pending/clients/:clientId/status', authMiddleware, async (req, res) => {
  try {
    if (!['manager', 'operator'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { payment_status, client_type, sale_ids } = req.body
    if (!['paid', 'unpaid'].includes(payment_status)) {
      return res.status(400).json({ message: 'Payment status must be paid or unpaid' })
    }

    const currentStatus = payment_status === 'paid' ? 'unpaid' : 'paid'

    if (client_type === 'sale') {
      const saleWhere = await getSaleWhereForUser(req.user)
      const sales = await Sale.findAll({
        where: {
          ...saleWhere,
          sale_id: sale_ids || [],
          payment_status: currentStatus
        }
      })

      if (sales.length === 0) {
        return res.status(404).json({ message: 'No matching sales found for this client' })
      }

      await Promise.all(sales.map(sale => {
        sale.payment_status = payment_status
        return sale.save()
      }))

      return res.json({ client_id: req.params.clientId, client_type, payment_status, deliveries: [], sales })
    }

    const deliveryWhere = await getDeliveryWhereForUser(req.user)
    const deliveries = await MilkDelivery.findAll({
      where: {
        ...deliveryWhere,
        farmer_id: req.params.clientId,
        payment_status: currentStatus
      }
    })

    if (deliveries.length === 0) {
      return res.status(404).json({ message: 'No matching deliveries found for this client' })
    }

    await Promise.all(deliveries.map(delivery => {
      delivery.payment_status = payment_status
      return delivery.save()
    }))

    const clientNames = Array.from(new Set(deliveries
      .map(delivery => delivery.farmer?.user?.full_name)
      .filter(Boolean)))
    const clientCodes = Array.from(new Set(deliveries
      .map(delivery => delivery.farmer?.farmer_code)
      .filter(Boolean)))
    const saleNameConditions = [
      ...clientNames.map(name => ({ client_name: name })),
      ...clientCodes.map(code => ({ client_name: code }))
    ]

    if (saleNameConditions.length > 0) {
      const saleWhere = await getSaleWhereForUser(req.user)
      await Sale.update(
        { payment_status },
        {
          where: {
            ...saleWhere,
            [Op.or]: saleNameConditions
          }
        }
      )
    }

    res.json({ client_id: `farmer:${req.params.clientId}`, client_type: 'farmer', payment_status, deliveries })
  } catch (err) {
    console.error('Client payment status endpoint error:', err)
    res.status(500).json({ message: 'Failed to update client payment status' })
  }
})

router.put('/pending/clients/:farmerId/schedule', authMiddleware, async (req, res) => {
  try {
    if (!['manager', 'operator'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { expected_payment_date, expected_payment_time } = req.body
    if (!expected_payment_date || !expected_payment_time) {
      return res.status(400).json({ message: 'Expected payment date and time are required' })
    }

    const deliveryWhere = await getDeliveryWhereForUser(req.user)
    const deliveries = await MilkDelivery.findAll({
      where: {
        ...deliveryWhere,
        farmer_id: req.params.farmerId,
        payment_status: 'unpaid'
      }
    })

    if (deliveries.length === 0) {
      return res.status(404).json({ message: 'No unpaid deliveries found for this client' })
    }

    await Promise.all(deliveries.map(delivery => {
      delivery.expected_payment_date = expected_payment_date
      delivery.expected_payment_time = expected_payment_time
      return delivery.save()
    }))

    res.json({ farmer_id: req.params.farmerId, deliveries })
  } catch (err) {
    console.error('Client payment schedule endpoint error:', err)
    res.status(500).json({ message: 'Failed to confirm client payment time' })
  }
})

router.put('/pending/:deliveryId/schedule', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role
    if (!['manager', 'operator'].includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { expected_payment_date, expected_payment_time } = req.body
    if (!expected_payment_date || !expected_payment_time) {
      return res.status(400).json({ message: 'Expected payment date and time are required' })
    }

    const delivery = await MilkDelivery.findByPk(req.params.deliveryId)
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' })
    }

    if (userRole === 'operator') {
      const op = await Operator.findOne({ where: { user_id: req.user.user_id } })
      const operatorId = op ? op.operator_id : req.user.user_id
      if (delivery.operator_id !== operatorId) {
        return res.status(404).json({ message: 'Delivery not found' })
      }
    }

    delivery.expected_payment_date = expected_payment_date
    delivery.expected_payment_time = expected_payment_time
    await delivery.save()

    res.json(delivery)
  } catch (err) {
    console.error('Payment schedule endpoint error:', err)
    res.status(500).json({ message: 'Failed to confirm payment time' })
  }
})

router.post('/', async (req, res) => {
  const { farmer_id, delivery_id, amount_paid, payment_method, processed_by } = req.body
  
  const delivery = await MilkDelivery.findByPk(delivery_id)
  const total_cost = delivery ? delivery.total_cost : 0
  const unpaid_balance = Math.max(0, parseFloat(total_cost) - parseFloat(amount_paid))
  
  const payment = await Payment.create({ farmer_id, delivery_id, amount_paid, unpaid_balance, payment_method, processed_by })
  
  if (parseFloat(amount_paid) >= total_cost) {
    delivery.payment_status = 'paid'
    await delivery.save()
  }
  
  res.status(201).json(payment)
})

export default router