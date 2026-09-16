import { Router } from 'express'
import { Product, Manager } from '../models.js'

const router = Router()

router.get('/', async (req, res) => {
  const products = await Product.findAll()
  res.json(products)
})

router.post('/', async (req, res) => {
  const { product_name, current_price, unit, created_by } = req.body
  const product = await Product.create({ product_name, current_price, unit, created_by })
  res.status(201).json(product)
})

router.put('/:id/price', async (req, res) => {
  const { current_price } = req.body
  const product = await Product.findByPk(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })
  const price = Number(current_price)
  if (!price || price <= 0) return res.status(400).json({ message: 'Price must be greater than zero' })
  product.current_price = price
  await product.save()
  res.json(product)
})

export default router