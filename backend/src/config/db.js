import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const dialect = process.env.DB_DIALECT || 'mysql';
let sequelizeInstance;

if (dialect === 'sqlite') {
  sequelizeInstance = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_FILE || 'data.sqlite',
    logging: false,
    define: { timestamps: true, underscored: false }
  });
} else {
  sequelizeInstance = new Sequelize(
    process.env.DB_NAME || 'kick_dev',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      dialect: 'mysql',
      logging: false,
      define: { timestamps: true, underscored: false }
    }
  );
}

export const sequelize = sequelizeInstance;

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    throw error;
  }
}
