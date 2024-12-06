// import { S3Client } from "@aws-sdk/client-s3";
import prisma from "../lib/prisma.js";

const GetProfileData_token = async (req, res) => {

  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch user data excluding departmentId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ntid: true, fullname: true, DoorCode: true,departmentId:true,subDepartment:true } // Removed departmentId
    });

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch department name using departmentId
    const department = await prisma.department.findUnique({
      where: { id: user.departmentId },
      select: { name: true }
    });

    // Fetch market data using doorCode
    const marketData = await prisma.marketStructure.findUnique({
      where: { doorCode: user.DoorCode },
      select: {
        market: { select: { market: true } },
        dmName: true,
      }
    });

    // Construct response without departmentId
    const response = {
      ntid: user.ntid,
      fullname: user.fullname,
      DoorCode: user.DoorCode||"N/A",
      departmentName: department ? department.name : "N/A",
      market: marketData?.market?.market || 'N/A',
      dmName: marketData?.dmName || 'N/A',
      role:user.subDepartment||"N/A",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching profile data:", error); // More specific error logging
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default GetProfileData_token;
