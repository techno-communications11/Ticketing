import multer from 'multer';
import prisma from '../lib/prisma.js';
import csv from 'csvtojson';

// Configure Multer to store file in memory instead of disk
const storage = multer.memoryStorage();
const excelUploads = multer({ storage });

const removeWhitespaceFromKeys = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    newObj[key.replace(/\s+/g, '')] = obj[key];
  });
  return newObj;
};

// Predefined markets with their IDs
const markets = [
  { _id: "1", market: "arizona" },
  { _id: "2", market: "colorado" },
  { _id: "3", market: "dallas" },
  { _id: "4", market: "el paso" },
  { _id: "5", market: "florida" },
  { _id: "6", market: "houston" },
  { _id: "7", market: "los angeles" },
  { _id: "8", market: "memphis" },
  { _id: "9", market: "nashville" },
  { _id: "10", market: "north carol" },
  { _id: "11", market: "sacramento" },
  { _id: "12", market: "san diego" },
  { _id: "13", market: "san francisco" },
  { _id: "14", market: "bay area" },
];

const MarketStructure = async (req, res) => {
  console.log("Received a request for market structure upload.");

  excelUploads.single('file')(req, res, async (err) => {
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
      const csvString = req.file.buffer.toString(); // Convert buffer to string
      const jsonData = await csv().fromString(csvString); // Parse CSV from string
      console.log('Parsed CSV Data:', jsonData);

      // Remove whitespace from keys and map to structured data
      const data = jsonData.map(item => removeWhitespaceFromKeys(item));
      const marketData = data.map(item => {
        const matchedMarket = markets.find(m => m.market.toLowerCase() === (item.Market || '').toLowerCase());
        return {
          bdiId: item.BDIID || '',
          storeName: item.StoreName || '',
          marketId: matchedMarket ? matchedMarket._id : null, // Assign matched market ID
          dmName: item.DMName || '',
          doorCode: item.DoorCode || '',
          storeAddress: item.StoreAddress || '',
        };
      });

      console.log('Data with matched market IDs:', marketData);

      // Filter out invalid records
      const validData = marketData.filter(item => item.marketId); // Ensure valid market IDs
      console.log('Valid data:', validData);

      // Fetch existing records based on bdiId and doorCode
      const existingRecords = await prisma.marketStructure.findMany({
        where: {
          OR: [
            { bdiId: { in: validData.map(item => item.bdiId) } },
            { doorCode: { in: validData.map(item => item.doorCode) } },
          ]
        }
      });
      console.log('Existing Records:', existingRecords);

      // Build sets of existing bdiId and doorCode for quick lookup
      const existingBdiIds = new Set(existingRecords.map(record => record.bdiId));
      const existingDoorCodes = new Set(existingRecords.map(record => record.doorCode));

      // Filter out duplicates
      const dataToInsert = validData.filter(item =>
        !existingBdiIds.has(item.bdiId) && !existingDoorCodes.has(item.doorCode)
      );
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
