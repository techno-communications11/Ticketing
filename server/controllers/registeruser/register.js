import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

const register = async (req, res) => {
  const { ntid, fullname, DoorCode, selectedRole, password } = req.body;
  console.log(req.body);

  // Validate input (You can replace this with a more robust validation approach)
  if (!ntid || !fullname  || !selectedRole || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // console.log(ntid, fullname, DoorCode, selectedRole, selectMarketValue, password);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { ntid },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const department = await prisma.department.findUnique({
      where: { name: selectedRole },  // Assuming 'selectedRole' contains department name
      select: { id: true },           // Get the department's id (as an ObjectId)
    });

    // Check if the department exists
    if (!department) {
      return res.status(400).json({ message: "Invalid department" });
    }

    const newUser = await prisma.user.create({
      data: {
        ntid,
        fullname,
        DoorCode,
        departmentId: department.id, 
        password: hashedPassword,
      },
    });
    
    // console.log(newUser);

    res.status(201).json({ message: "User registered successfully", user: newUser });

  } catch (error) {
    console.error(error); // Log the error details for debugging
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

export default register;
