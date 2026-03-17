const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD || "",
  {
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  let connected = false;
  while (!connected) {
    try {
      await sequelize.authenticate();
      console.log("✅ Connected to database:", sequelize.getDatabaseName());
      connected = true;
    } catch (err) {
      console.error("❌ MySQL connection error:", err.code, err.message);
      console.log("Retrying in 3 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

module.exports = { sequelize, connectDB };