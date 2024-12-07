import uploadImages from "../../multer/imageUpload.js";
import prisma from "../lib/prisma.js";
import { uploadToS3 } from "../../multer/imageUpload.js"; // Import the S3 upload function

const createTicket = async (req, res) => {
    uploadImages.fields([{ name: 'cameraFile', maxCount: 5 }, { name: 'fileSystemFile', maxCount: 5 }])(req, res, async (err) => {
        if (err) {
            console.error("Multer error: ", err);
            return res.status(400).send('Error uploading files.');
        }

        if (!req.files || !req.body) {
            return res.status(400).send('No files or form data uploaded.');
        }

        const { ntid, fullname, phone, market, store, department,subdepartment, departmentId, ticketSubject, description } = req.body;
        console.log('Request Body: 0000000000000000000000000000', req.body);

        try {
            // Fetch department manager details
            const dmData = await prisma.marketStructure.findMany({
                where: { storeName: store },
                select: { dmName: true }
            });

            if (!dmData || dmData.length === 0) {
                return res.status(404).send('Department Manager not found for the selected store.');
            }

            const dmName = dmData[0].dmName;

            // Validate phone number
            const phoneNumber = parseInt(phone, 10);
            if (isNaN(phoneNumber)) {
                return res.status(400).send('Invalid phone number.');
            }

            // Check required fields
            if (!ntid || !phoneNumber || !store || !market || !ticketSubject || !description || !department) {
                return res.status(400).send('Missing required form fields.');
            }

            // Handle file uploads
            const cameraFileUrls = req.files['cameraFile']
                ? await Promise.all(req.files['cameraFile'].map(file => uploadToS3(file)))
                : [];

            const fileSystemFileUrls = req.files['fileSystemFile']
                ? await Promise.all(req.files['fileSystemFile'].map(file => uploadToS3(file)))
                : [];

            // Generate ticket ID
            const currentDate = new Date();
            const TicketId = `${ntid.slice(0,3)}${currentDate.getUTCFullYear()}${("0" + (currentDate.getUTCMonth() + 1)).slice(-2)}${("0" + currentDate.getUTCDate()).slice(-2)}${("0" + currentDate.getUTCHours()).slice(-2)}${("0" + currentDate.getUTCMinutes()).slice(-2)}${("0" + currentDate.getUTCSeconds()).slice(-2)}`;
            
            // Handle departmentId or use default
           // Handle departmentId or use default
           let departmentConnect;
           let assignedToValue = "";
           
           // Check if departmentId is empty or undefined
           if (!departmentId || typeof departmentId !== "string" || departmentId.trim() === "") {
               // Fetch dmName based on the store when departmentId is empty
               const dmData = await prisma.marketStructure.findMany({
                   where: { storeName: store },
                   select: { dmName: true },
               });
           
               if (dmData && dmData.length > 0) {
                   assignedToValue = dmData[0].dmName || "";
               }
           
               // Use default department ID if no departmentId is provided
               departmentConnect = { connect: { id: "19" } };
           } else {
               // If departmentId has a value, set assignedTo to an empty string
               assignedToValue = "";
               
               // Validate and connect to the specified department
               const deprId = await prisma.department.findUnique({
                   where: { name: departmentId.trim() },
               });
           
               if (deprId) {
                   departmentConnect = { connect: { id: deprId.id } };
               }
           }
           
           // If no valid department is found, fallback to default
           if (!departmentConnect) {
               departmentConnect = { connect: { id: "19" } };
           }
           
           

            // Create the ticket
            const newTicket = await prisma.createTicket.create({
                data: {
                    ticketId: TicketId,
                    ntid,
                    fullname,
                    phoneNumber,
                    market,
                    selectStore: store,
                    selectedDepartment: department,
                    selectedSubdepartment: subdepartment,
                    ticketRegarding: ticketSubject,
                    description,
                    status: { connect: { id: '1' } },
                    department: departmentConnect,
                    assignedTo: assignedToValue, // Dynamically assigned value
                    openedBy: null,
                    files: {
                        cameraFiles: cameraFileUrls,
                        fileSystemFiles: fileSystemFileUrls,
                    },
                    user: {
                        connect: {
                            id: req.user.id,
                        },
                    },
                    createdAt: new Date(),
                },
            });
            
            

            console.log("Created ticket: ", newTicket);

            res.status(200).json({
                message: 'Ticket created successfully',
                ticket: newTicket,
            });
        } catch (error) {
            console.error('Error creating ticket:', error);
            res.status(500).send('Failed to create ticket.');
        }
    });
};

export default createTicket;

