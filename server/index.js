import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { sequelize } from './db.js'
import './models.js'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import deliveryRoutes from './routes/deliveries.js'
import qualityRoutes from './routes/quality.js'
import productRoutes from './routes/products.js'
import saleRoutes from './routes/sales.js'
import paymentRoutes from './routes/payments.js'
import tankRoutes from './routes/tank.js'
import announcementRoutes from './routes/announcements.js'
import messageRoutes from './routes/messages.js'
import statsRoutes from './routes/stats.js'
import farmersRoutes from './routes/farmers.js'
import { Product, Manager, User } from './models.js'
import { DataTypes } from 'sequelize'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}))
app.use(express.json())
// Health check
app.get("/", (req, res) => {
  res.json({
    message: "MCC Systems Backend is running successfully"
  });
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/farmers', farmersRoutes)
app.use('/api/quality', qualityRoutes)
app.use('/api/products', productRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/tank', tankRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/stats', statsRoutes)

sequelize.authenticate()
  .then(() => {
    console.log('Database connected')

    const queryInterface = sequelize.getQueryInterface()

    return queryInterface.describeTable('milk_deliveries')
      .then(columns => {
        return Promise.all([
          columns.expected_payment_date
            ? Promise.resolve()
            : queryInterface.addColumn(
                'milk_deliveries',
                'expected_payment_date',
                {
                  type: DataTypes.DATEONLY,
                  allowNull: true
                }
              ),

          columns.expected_payment_time
            ? Promise.resolve()
            : queryInterface.addColumn(
                'milk_deliveries',
                'expected_payment_time',
                {
                  type: DataTypes.TIME,
                  allowNull: true
                }
              )
        ])
      })
      .then(() => queryInterface.describeTable('milk_quality_tests'))
      .then(columns => {
        if (!columns.specific_gravity) {
          return queryInterface.addColumn(
            'milk_quality_tests',
            'specific_gravity',
            {
              type: DataTypes.DECIMAL(4, 3),
              allowNull: true
            }
          )
        }
      })
  })
  .then(() => {
    console.log('Payment schedule columns ready')
    return sequelize.sync()
  })
  .then(() => {
    console.log('Database synchronized')

    return Manager.findOne({
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    })
  })
  .then(async manager => {
    if (!manager) {
      let managerUser = await User.findOne({
        where: {
          email: process.env.DEFAULT_MANAGER_EMAIL || 'manager@mcc.rw'
        }
      })

      if (!managerUser) {
        managerUser = await User.create({
          full_name: 'Default Manager',
          email: process.env.DEFAULT_MANAGER_EMAIL || 'manager@mcc.rw',
          password: await bcrypt.hash(
            process.env.DEFAULT_MANAGER_PASSWORD || 'CHANGE_THIS_PASSWORD',
            10
          ),
          role: 'manager',
          phone: '0000000000'
        })
      }

      await Manager.create({
        user_id: managerUser.user_id
      })
    }

    const productCount = await Product.count()

    if (productCount === 0) {
      const currentManager = await Manager.findOne({
        include: [
          {
            model: User,
            as: 'user'
          }
        ]
      })

      await Product.bulkCreate([
        {
          product_name: 'Fresh Milk',
          current_price: 1500,
          unit: 'L',
          created_by: currentManager?.manager_id || 1
        },
        {
          product_name: 'Yogurt',
          current_price: 2500,
          unit: 'Kg',
          created_by: currentManager?.manager_id || 1
        },
        {
          product_name: 'Cheese',
          current_price: 5000,
          unit: 'Kg',
          created_by: currentManager?.manager_id || 1
        }
      ])

      console.log('Default products created')
    }
  })
  .catch(err => {
    console.error('Database error:', err.message || err)
  })

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})