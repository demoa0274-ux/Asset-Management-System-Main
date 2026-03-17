const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/db"); // your Sequelize instance
const { QueryTypes } = require("sequelize");

exports.bulkImportUsers = async (req, res) => {
  const { users } = req.body;

  if (!users || !Array.isArray(users)) {
    return res.status(400).json({ message: "Invalid data format." });
  }

  try {
    // 1️⃣ Filter valid users
    const validUsers = users.filter(u => u.name && u.email && u.password);

    if (!validUsers.length) {
      return res.status(400).json({ message: "No valid users found." });
    }

    // 2️⃣ Remove duplicate emails in the Excel/CSV itself
    const uniqueMap = new Map();
    validUsers.forEach(u => uniqueMap.set(u.email.toLowerCase(), u));
    const uniqueUsers = Array.from(uniqueMap.values());

    const emails = uniqueUsers.map(u => u.email.toLowerCase());

    // 3️⃣ Check existing emails in DB
    const existing = await sequelize.query(
      `SELECT email FROM users WHERE email IN (:emails)`,
      {
        replacements: { emails },
        type: QueryTypes.SELECT
      }
    );

    const existingSet = new Set(existing.map(e => e.email.toLowerCase()));

    // 4️⃣ Filter out users that already exist
    const usersToInsert = uniqueUsers.filter(
      u => !existingSet.has(u.email.toLowerCase())
    );

    if (!usersToInsert.length) {
      return res.status(400).json({
        message: "All users already exist.",
      });
    }

    // 5️⃣ Hash passwords
    const hashedData = await Promise.all(
      usersToInsert.map(async u => {
        const hash = await bcrypt.hash(u.password, 10);
        return {
          name: u.name,
          email: u.email.toLowerCase(),
          password: hash
        };
      })
    );

    // 6️⃣ Bulk insert using Sequelize
    // Sequelize raw query with multiple VALUES
    const values = hashedData.map(u => `('${u.name}', '${u.email}', '${u.password}')`).join(", ");
    await sequelize.query(
      `INSERT INTO users (name, email, password) VALUES ${values}`
    );

    res.json({
      message: `${hashedData.length} users imported successfully.`,
    });

  } catch (err) {
    console.error("Bulk import error:", err);
    res.status(500).json({ message: "Import failed." });
  }
};
