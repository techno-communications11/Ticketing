import multer from 'multer';
import prisma from '../lib/prisma.js';
import csv from 'csvtojson';
import bcrypt from 'bcrypt';

// Configure Multer to store file in memory instead of disk
const storage = multer.memoryStorage();
const excelUploads = multer({ storage });

// Function to remove whitespace from keys in an object
const removeWhitespaceFromKeys = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    newObj[key.replace(/\s+/g, '')] = obj[key];
  });
  return newObj;
};

// RegisterCode function to handle user registration from CSV
const RegisterCode = async (req, res) => {
  console.log("Received a request for user registration.");

  excelUploads.single('file')(req, res, async (err) => {
    if (err) {
      console.log('Multer Error:', err);
      return res.status(400).send({ status: 400, success: false, msg: 'File upload error: ' + err.message });
    }

    try {
      // Check if a file is received
      if (!req.file) {
        console.log('No file received');
        throw new Error('File upload failed: No file object found.');
      }

      console.log('File received:', req.file.originalname);

      // Parse CSV data from file buffer
      let jsonData;
      try {
        const csvString = req.file.buffer.toString(); 
        jsonData = await csv().fromString(csvString); 
        console.log('Parsed CSV Data:', jsonData);
      } catch (parseError) {
        throw new Error(`CSV parsing failed: ${parseError.message}`);
      }

      // Process and clean data
      const userData = jsonData.map(item => removeWhitespaceFromKeys(item));

      // Prepare data to insert, filtering out rows with empty NTID
      const usersToInsert = (await Promise.all(userData.map(async (item) => {
        const department = await prisma.department.findUnique({
          where: { name: item.selectedRole },
        });
        if (!department) return null;
        return {
          ntid: item.ntid,
          fullname: item.fullname,
          departmentId: department.id,
          DoorCode: item.DoorCode,
          password: item.Password ? await bcrypt.hash(item.Password, 10) : '',
        };
      }))).filter(Boolean);
      

      // console.log('Data to insert:', usersToInsert);

      // Check for existing records
      const existingRecords = await prisma.user.findMany({
        where: {
          OR: [
            { ntid: { in: usersToInsert.map(user => user.ntid) } },
            // { DoorCode: { in: usersToInsert.map(user => user.DoorCode) } }
          ]
        }
      });
      console.log('Existing Records:', existingRecords);

      const existingIds = new Set(existingRecords.map(record => record.ntid));
      const dataToInsert = usersToInsert.filter(user => !existingIds.has(user.ntid));
      console.log('Data to insert after filtering existing records:', dataToInsert);

      // Insert new records
      if (dataToInsert.length > 0) {
        try {
          await prisma.user.createMany({ data: dataToInsert });
          console.log('Data successfully inserted into the database.');
        } catch (dbError) {
          throw new Error(`Database insertion failed: ${dbError.message}`);
        }
      } else {
        console.log('No new user data to insert.');
      }

      res.status(200).send({ status: 200, success: true, msg: 'CSV file successfully processed', data: dataToInsert });
    } catch (error) {
      console.error('Error during processing:', error.stack);
      res.status(400).send({ status: 400, success: false, msg: error.message, error: error.stack });
    }
  });
};

export default RegisterCode;
