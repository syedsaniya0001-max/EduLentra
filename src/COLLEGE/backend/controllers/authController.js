const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

const login = async (req, res) => {
  try {
    const { username, password, role } = req.body || {};

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      !password ||
      typeof role !== "string"
    ) {
      return res.status(400).json({
        message: "Username, password and role are required",
      });
    }

    const identifier = username.trim();
    let userModel;
    let query;
    if (role === "admin") {
      userModel = Admin;
      query = { username: identifier.toLowerCase(), isActive: true };
    } else if (role === "student") {
      userModel = Student;
      query = { rollNumber: identifier, isActive: true };
    } else if (role === "faculty") {
      userModel = Faculty;
      query = {
        [identifier.includes("@") ? "email" : "facultyId"]:
          identifier.includes("@") ? identifier.toLowerCase() : identifier,
        isActive: true,
      };
    } else if (role === "hod") {
      userModel = HOD;
      query = { hodId: identifier, isActive: true };
    } else {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const user = await userModel.findOne(query);
    if (!user) {
      return res.status(401).json({
        message: "Account not found or not approved",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id, role);

    res.status(200).json({
      message: "Login successful",
      token,
      role,
      user: {
        id: user._id,
        name:
          user.name ||
          user.fullName ||
          user.username ||
          user.rollNumber ||
          user.facultyId ||
          user.hodId,
        username: user.username || user.rollNumber || user.facultyId || user.hodId,
        rollNumber: user.rollNumber || undefined,
        email: user.email || "",
        department: user.department || user.branch || "",
        role,
      },
    });
  } catch {
    res.status(500).json({
      message: "Login service is unavailable. Please try again later.",
    });
  }
};

module.exports = {
  login,
};