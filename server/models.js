import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

export const User = sequelize.define('users', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('manager', 'operator', 'farmer'), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  profile_image: { type: DataTypes.STRING(255) },
  status: { type: DataTypes.STRING(20), defaultValue: 'active' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const Farmer = sequelize.define('farmers', {
  farmer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  farmer_code: { type: DataTypes.STRING(50), allowNull: false },
  location: { type: DataTypes.STRING(100) },
  momo_account: { type: DataTypes.STRING(20) },
  national_id: { type: DataTypes.STRING(20) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const Operator = sequelize.define('operators', {
  operator_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  operator_code: { type: DataTypes.STRING(50), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const Manager = sequelize.define('managers', {
  manager_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const MilkDelivery = sequelize.define('milk_deliveries', {
  delivery_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  delivery_person: { type: DataTypes.STRING(100) },
  quantity_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  delivery_date: { type: DataTypes.DATEONLY, allowNull: false },
  delivery_time: { type: DataTypes.TIME },
  farmer_id: { type: DataTypes.INTEGER, allowNull: true },
  operator_id: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('accepted', 'rejected'), defaultValue: 'accepted' },
  payment_status: { type: DataTypes.ENUM('paid', 'unpaid'), defaultValue: 'unpaid' },
  expected_payment_date: { type: DataTypes.DATEONLY, allowNull: true },
  expected_payment_time: { type: DataTypes.TIME, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const MilkQualityTest = sequelize.define('milk_quality_tests', {
  quality_test_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  delivery_id: { type: DataTypes.INTEGER, allowNull: false },
  tested_by: { type: DataTypes.INTEGER, allowNull: false },
  appearance: { type: DataTypes.ENUM('good', 'bad') },
  smell: { type: DataTypes.ENUM('good', 'bad') },
  taste: { type: DataTypes.ENUM('good', 'bad') },
  temperature: { type: DataTypes.DECIMAL(5, 2) },
  lactometer_reading: { type: DataTypes.DECIMAL(5, 2) },
  acidity_test: { type: DataTypes.ENUM('normal', 'abnormal') },
  antibiotic_test: { type: DataTypes.ENUM('positive', 'negative') },
  specific_gravity: { type: DataTypes.DECIMAL(4, 3) },
  organoleptic_result: { type: DataTypes.ENUM('pass', 'fail') },
  final_decision: { type: DataTypes.ENUM('accepted', 'rejected') },
  tested_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const Product = sequelize.define('products', {
  product_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_name: { type: DataTypes.STRING(100), allowNull: false },
  current_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  unit: { type: DataTypes.ENUM('L', 'Kg') },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const Sale = sequelize.define('sales', {
  sale_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  operator_id: { type: DataTypes.INTEGER, allowNull: false },
  client_name: { type: DataTypes.STRING(100) },
  quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_status: { type: DataTypes.ENUM('paid', 'unpaid'), defaultValue: 'unpaid' },
  sale_date: { type: DataTypes.DATEONLY, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const MilkTank = sequelize.define('milk_tank', {
  tank_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  current_quantity: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  capacity: { type: DataTypes.DECIMAL(10, 2), defaultValue: 15000 },
  last_updated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const Payment = sequelize.define('payments', {
  payment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  farmer_id: { type: DataTypes.INTEGER, allowNull: false },
  delivery_id: { type: DataTypes.INTEGER, allowNull: false },
  amount_paid: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  unpaid_balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_method: { type: DataTypes.ENUM('momo', 'cash', 'bank') },
  processed_by: { type: DataTypes.INTEGER, allowNull: false },
  payment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const Announcement = sequelize.define('announcements', {
  announcement_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  target_role: { type: DataTypes.ENUM('farmer', 'operator', 'all'), allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export const Message = sequelize.define('messages', {
  message_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('seen', 'unseen'), defaultValue: 'unseen' }
})

Farmer.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
User.hasOne(Farmer, { foreignKey: 'user_id', as: 'farmer' })

Operator.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
User.hasOne(Operator, { foreignKey: 'user_id', as: 'operator' })

Manager.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
User.hasOne(Manager, { foreignKey: 'user_id', as: 'manager' })

MilkDelivery.belongsTo(Farmer, { foreignKey: 'farmer_id', as: 'farmer', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
MilkDelivery.belongsTo(Operator, { foreignKey: 'operator_id', as: 'operator', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
Farmer.hasMany(MilkDelivery, { foreignKey: 'farmer_id', onDelete: 'SET NULL' })
Operator.hasMany(MilkDelivery, { foreignKey: 'operator_id', onDelete: 'SET NULL' })

MilkQualityTest.belongsTo(MilkDelivery, { foreignKey: 'delivery_id', as: 'delivery' })
MilkQualityTest.belongsTo(Operator, { foreignKey: 'tested_by', as: 'tester' })
MilkDelivery.hasOne(MilkQualityTest, { foreignKey: 'delivery_id' })
Operator.hasMany(MilkQualityTest, { foreignKey: 'tested_by' })

Sale.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })
Sale.belongsTo(Operator, { foreignKey: 'operator_id', as: 'operator' })
Product.hasMany(Sale, { foreignKey: 'product_id' })
Operator.hasMany(Sale, { foreignKey: 'operator_id' })

Payment.belongsTo(Farmer, { foreignKey: 'farmer_id', as: 'farmer' })
Payment.belongsTo(MilkDelivery, { foreignKey: 'delivery_id', as: 'delivery' })
Payment.belongsTo(Manager, { foreignKey: 'processed_by', as: 'processor' })

Announcement.belongsTo(Manager, { foreignKey: 'created_by', as: 'creator' })

Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' })
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' })