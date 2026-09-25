const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully.");

    const email = "admin@cinebook.com";
    const password = "Admin@123";
    const name = "CineBook Admin";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.name = name;
      existingAdmin.password = await bcrypt.hash(password, 10);
      existingAdmin.role = "admin";

      await existingAdmin.save();

      console.log("========================================");
      console.log("ADMIN ACCOUNT UPDATED");
      console.log("========================================");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      });

      console.log("========================================");
      console.log("ADMIN ACCOUNT CREATED");
      console.log("========================================");
    }

    console.log("Email:    admin@cinebook.com");
    console.log("Password: Admin@123");
    console.log("Role:     admin");
    console.log("========================================");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("========================================");
    console.error("ADMIN CREATION ERROR");
    console.error("========================================");
    console.error(error);

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {}

    process.exit(1);
  }
}

createAdmin();