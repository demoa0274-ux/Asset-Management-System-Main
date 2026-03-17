// backend/models/User.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    role: {
      type: DataTypes.ENUM("admin", "subadmin", "user"),
      allowNull: false,
      defaultValue: "user",
    },
    
    img_url: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },


    reset_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    reset_otp_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true, // DB: created_at, updated_at, reset_otp, reset_otp_expires
  }
);

module.exports = User;
