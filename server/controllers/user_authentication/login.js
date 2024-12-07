import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
  const { ntid, password } = req.body;
  console.log(ntid, password);

  try {
    // Find user by NTID
    const user = await prisma.user.findUnique({
      where: { ntid },
      select: {
        id: true,
        password: true,
        ntid: true,
        fullname: true,
        DoorCode: true,
        subDepartment: true,  // Optional field
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Handle case where user is not found
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Ensure department exists
    if (!user.department || !user.department.id) {
      return res.status(400).json({ message: "Department not found" });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // JWT token generation
    const tokenExpiration = '7d';
    const token = jwt.sign(
      {
        id: user.id,
        department: user.department.name,
        ntid: user.ntid,
        fullname: user.fullname,
        subDepartment: user.subDepartment ?? 'N/A',  // Optional fallback for subDepartment
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: tokenExpiration }
    );

    // Set JWT token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure cookie in production
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    // Successful login response
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

export default login;
