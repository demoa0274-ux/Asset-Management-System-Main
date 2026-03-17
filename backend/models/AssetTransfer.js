// backend/models/AssetTransfer.js
module.exports = (sequelize, DataTypes) => {
  const AssetTransfer = sequelize.define(
    "AssetTransfer",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      assetCode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Unique asset code: FORMAT-ID (e.g., LAPTOP-1, DESKTOP-5)",
      },

      section: {
        type: DataTypes.STRING(30),
        allowNull: false, // desktop/laptop/printer/...
      },

      assetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      fromBranchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      toBranchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      transferredBy: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
    },
    {
      tableName: "asset_transfers",
      timestamps: true, // createdAt / updatedAt
    }
  );

  return AssetTransfer;
};
