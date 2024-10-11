import multer from 'multer';
import prisma from '../lib/prisma.js';
import csv from 'csvtojson';

// Configure Multer to store file in memory instead of disk
const storage = multer.memoryStorage();
const excelUploads = multer({ storage });

const removeWhitespaceFromKeys = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    newObj[key.replace(/\s+/g, '')] = obj[key];
  });
  return newObj;
};

const MarketStructure = async (req, res) => {
  console.log("Received a request for market structure upload.");

  excelUploads.single('file')(req, res, async (err) => 
  {
    if (err) {
      console.log('Multer Error:', err);
      return res.status(400).send({ status: 400, success: false, msg: 'File upload error: ' + err.message });
    }

    try {
      if (!req.file) {
        console.log('No file received');
        throw new Error('File upload failed: No file object found.');
      }

      console.log('File received:', req.file.originalname);

      // Parse CSV data from file buffer
      let jsonData;
      try {
        const csvString = req.file.buffer.toString(); // Convert buffer to string
        jsonData = await csv().fromString(csvString); // Parse CSV from string
        console.log('Parsed CSV Data:', jsonData);
      } catch (parseError) {
        throw new Error(`CSV parsing failed: ${parseError.message}`);
      }

      const data = jsonData.map(item => removeWhitespaceFromKeys(item));

      const maketdata = data.map(item => ({
        boiId: item.boiId || '',    
        storeName: item.StoreName || '',
        market: item.Market || '',     
        dmName: item.DMName || '',    
        doorCode: item.DoorCode || '',    
        StoreAddress: item.StoreAddress || '', 
        googleMap: item.GoogleMap || '',   
        storeEmail: item.StoreEmail || ''
      }));

      console.log('Data to insert:', maketdata);

      const existingRecords = await prisma.marketStructure.findMany({
        where: {
          OR: [
            { boiId: { in: maketdata.map(item => item.boiId) } },
            { doorCode: { in: maketdata.map(item => item.doorCode) } },
            { storeEmail: { in: maketdata.map(item => item.storeEmail) } }
          ]
        }
      });
      console.log('Existing Records:', existingRecords);

      const existingIds = new Set(existingRecords.map(record => record.boiId));
      const dataToInsert = maketdata.filter(item => !existingIds.has(item.boiId));
      console.log('Data to insert after filtering existing records:', dataToInsert);

      if (dataToInsert.length > 0) {
        try {
          await prisma.marketStructure.createMany({ data: dataToInsert });
          console.log('Data successfully inserted into the database.');
        } catch (dbError) {
          throw new Error(`Database insertion failed: ${dbError.message}`);
        }
      } else {
        console.log('No new data to insert.');
      }

      res.status(200).send({ status: 200, success: true, msg: 'CSV file successfully processed', data: dataToInsert });
    } catch (error) {
      console.error('Error during processing:', error.stack);
      res.status(400).send({ status: 400, success: false, msg: error.message, error: error.stack });
    }
  });
};

export default MarketStructure;
