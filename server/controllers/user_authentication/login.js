import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
  const { ntid, password } = req.body;
  console.log(ntid, password);

  try {
    const user = await prisma.user.findUnique({
      where: { ntid: ntid },
      select: {
        id: true,
        password: true,
        ntid: true,
        fullname: true,
        DoorCode: true,
     
        department: {
          select: {
            id: true,
            name: true 
          }
        }
      }
    });
    // const market = await prisma.marketStructure.findUnique({
    //   where: { doorCode: user.DoorCode },
    //   include: {
    //     market: { 
    //       select: { market: true }, 
    //     },
    //   },
    // });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!user.department.id) {
      return res.status(400).json({ message: "Department not found" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    

    const isPasswordValid = await bcrypt.compare(password, user.password);
if (!isPasswordValid) {
  return res.status(401).json({ message: "Invalid username or password" });
}

    const tokenExpiration = '7d';
    const token = jwt.sign(
      {
        id: user.id,
        department: user.department.name,
        ntid: user.ntid,
        fullname: user.fullname
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: tokenExpiration }
    );
    res.cookie('token', token, {
      httpOnly: true, 
      maxAge: 1000 * 60 * 60 * 24 * 7 
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to login" });
  }
};

export default login;
