import prisma from '../lib/prisma.js';

const GetUsers = async (req, res) => {
  const userId = req.user?.id; // Ensure userId is extracted safely

  if (!userId) {
    return res.status(400).json({ message: "User ID not provided" });
  }

  try {
    // Fetch the logged-in user's department
    const loggedInUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true }
    });

    if (!loggedInUser) {
      return res.status(404).json({ message: "Logged-in user not found" });
    }

    let { departmentId } = loggedInUser;
    if(departmentId==='22'){
      departmentId='11'

    }
    if(departmentId==='23'){
      departmentId='12'

    }

    // Fetch all team members from the same department
    const teamMembers = await prisma.user.findMany({
      where: { departmentId },
      select: {
        fullname: true, 
      }
    });

    if (teamMembers.length === 0) {
      return res.status(404).json({ message: "No team members found in this department" });
    }
 console.log(teamMembers,"team")
    return res.status(200).json({ teamMembers });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return res.status(500).json({ message: "Failed to fetch team members" });
  }
};

export default GetUsers;
