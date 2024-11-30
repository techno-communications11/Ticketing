import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';


const UpdateUser = async (req, res) => {
    const updatedData = req.body;

    // console.log('Incoming update data:', updatedData); // Log incoming data

    try {
        const hashedPassword = await bcrypt.hash(updatedData.password, 10);

        await prisma.user.update({
          where: { ntid: updatedData.ntid },
          data: { 
              password: hashedPassword, // Only update the password, fullname, and manager
          },
      });
      

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error('Error updating user:', error); // Log error details
       
            res.status(500).json({ message: "Failed to update user" });
    }
};

export default UpdateUser;
