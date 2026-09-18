import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const useSSL = Boolean(process.env.DB_SSL_CA)

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'mcc_system',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    logging: false,

    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: true,
            ca: process.env.DB_SSL_CA?.replace(/\\n/g, '\n')
          }
        }
      : {}
  }
)