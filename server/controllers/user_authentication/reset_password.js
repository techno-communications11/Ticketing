import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

const resetPassword = async (req, res) => {
  const { password } = req.body;
  // console.log(password,"psdw");

  try {
    const userId = req.user.id;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password" });
  }
};

export default resetPassword;
