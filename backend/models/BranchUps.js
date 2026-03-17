  // backend/models/BranchUps.js
  const { DataTypes } = require("sequelize");
  const { sequelize } = require("../config/db");

  const BranchUps = sequelize.define(
    "BranchUps",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      assetId: { type: DataTypes.STRING(100), allowNull: true },

      branchId: { type: DataTypes.INTEGER, allowNull: false, unique: true },

      // NEW
      sub_category_code: { type: DataTypes.STRING(5), allowNull: true },

      ups_model: { type: DataTypes.STRING },
      ups_backup_time: { type: DataTypes.STRING },
      ups_installer: { type: DataTypes.STRING },
      ups_rating: { type: DataTypes.STRING },
      battery_rating: { type: DataTypes.STRING },
      ups_purchase_year: { type: DataTypes.INTEGER },

      ups_status: { type: DataTypes.STRING },
      remarks: { type: DataTypes.STRING },
    },
    { tableName: "branch_ups", timestamps: true }
  );

  module.exports = BranchUps;
