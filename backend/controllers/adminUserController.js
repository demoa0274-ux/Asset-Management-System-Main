const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  if (value === "admin") return "admin";
  if (value === "subadmin" || value === "sub_admin" || value === "sub-admin") {
    return "subadmin";
  }
  if (value === "user") return "user";

  return null;
};

const isAdminFlagFromRole = (role) => role === "admin";

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
  const { name, email, password, role = "user" } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRole = normalizeRole(role);

  if (!normalizedRole) {
    return res.status(400).json({ message: "Invalid role. Allowed: admin, subadmin, user" });
  }

  const exists = await User.findOne({ where: { email: normalizedEmail } });
  if (exists) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashed,
    role: normalizedRole,
    is_admin: isAdminFlagFromRole(normalizedRole),
  });

  res.status(201).json({
    message: "User created",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin,
    },
  });
});

// UPDATE user
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body || {};

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const payload = {};

  if (name !== undefined) {
    payload.name = String(name).trim();
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const existingEmailUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingEmailUser && Number(existingEmailUser.id) !== Number(id)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    payload.email = normalizedEmail;
  }

  if (role !== undefined) {
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
      return res.status(400).json({ message: "Invalid role. Allowed: admin, subadmin, user" });
    }

    payload.role = normalizedRole;
    payload.is_admin = isAdminFlagFromRole(normalizedRole);
  }

  if (password !== undefined && String(password).trim() !== "") {
    payload.password = await bcrypt.hash(String(password), 10);
  }

  await user.update(payload);

  res.json({
    message: "User updated",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin,
    },
  });
});

// DELETE user
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (Number(req.user?.id) === Number(id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.destroy();
  res.json({ message: "User deleted" });
});