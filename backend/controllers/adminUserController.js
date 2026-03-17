// backend/controllers/adminUserController.js
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// GET all users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role", "is_admin", "created_at", "updated_at"],
    order: [["id", "DESC"]],
  });
  res.json({ data: users });
});

// CREATE user
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "user", is_admin = false } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password are required" });
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    is_admin: !!is_admin,
  });

  res.status(201).json({
    message: "User created",
    data: { id: user.id, name: user.name, email: user.email, role: user.role, is_admin: user.is_admin },
  });
});

// UPDATE user (name/email/role/is_admin) + optional password reset
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, is_admin, password } = req.body || {};

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // prevent admin locking themselves accidentally (optional safeguard)
  // if (Number(req.user?.id) === Number(id) && role && role !== "admin") {
  //   return res.status(400).json({ message: "You cannot change your own role" });
  // }

  const payload = {};
  if (name !== undefined) payload.name = name;
  if (email !== undefined) payload.email = email;
  if (role !== undefined) payload.role = role;
  if (is_admin !== undefined) payload.is_admin = !!is_admin;

  if (password) {
    payload.password = await bcrypt.hash(password, 10);
  }

  await user.update(payload);

  res.json({
    message: "User updated",
    data: { id: user.id, name: user.name, email: user.email, role: user.role, is_admin: user.is_admin },
  });
});

// DELETE user
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (Number(req.user?.id) === Number(id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.destroy();
  res.json({ message: "User deleted" });
});
