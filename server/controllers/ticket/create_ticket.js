import uploadImages from '../../multer/imageUpload.js';
import prisma from '../lib/prisma.js';
import { uploadToS3 } from '../../multer/imageUpload.js';  // Import the S3 upload function

const createTicket = async (req, res) => {
    // Set up multer to accept multiple files per field
    uploadImages.fields([{ name: 'cameraFile', maxCount: 5 }, { name: 'fileSystemFile', maxCount: 5 }])(req, res, async (err) => {
        if (err) {
            return res.status(400).send('Error uploading files.');
        }

        if (!req.files || !req.body) {
            return res.status(400).send('No files or form data uploaded.');
        }

        const { ntid, fullname, phone, market, store, department, ticketSubject, description } = req.body;

        try {
            const dmData = await prisma.marketStructure.findMany({
                where: { storeName: store },
                select: { dmName: true }
            });

            if (!dmData || dmData.length === 0) {
                return res.status(404).send('Department Manager not found for the selected store.');
            }

            const dmName = dmData[0].dmName;

            const phoneNumber = parseInt(phone, 10);
            if (isNaN(phoneNumber)) {
                return res.status(400).send('Invalid phone number.');
            }

            if (!ntid || !phoneNumber || !store || !market || !ticketSubject || !description || !department) {
                return res.status(400).send('Missing required form fields.');
            }

            // Handle camera files upload
            let cameraFileUrls = [];
            if (req.files['cameraFile']) {
                const cameraFiles = req.files['cameraFile']; // An array of files
                for (let file of cameraFiles) {
                    const fileUrl = await uploadToS3(file);  // Upload each file to S3 and get URL
                    cameraFileUrls.push(fileUrl);
                }
            }

            // Handle file system files upload
            let fileSystemFileUrls = [];
            if (req.files['fileSystemFile']) {
                const fileSystemFiles = req.files['fileSystemFile']; // An array of files
                for (let file of fileSystemFiles) {
                    const fileUrl = await uploadToS3(file);  // Upload each file to S3 and get URL
                    fileSystemFileUrls.push(fileUrl);
                }
            }

            const currentDate = new Date();
            const TicketId = ntid + currentDate.getUTCFullYear() +
                ("0" + (currentDate.getUTCMonth() + 1)).slice(-2) +
                ("0" + currentDate.getUTCDate()).slice(-2) +
                ("0" + currentDate.getUTCHours()).slice(-2) +
                ("0" + currentDate.getUTCMinutes()).slice(-2) +
                ("0" + currentDate.getUTCSeconds()).slice(-2);

            // Create a new ticket in the database
            const newTicket = await prisma.createTicket.create({
                data: {
                    ticketId: TicketId,
                    ntid,
                    fullname,
                    phoneNumber,
                    market,
                    selectStore: store,
                    selectedDepartment: department, 
                    ticketRegarding: ticketSubject,
                    description,
                    status: { connect: { id: '1' } },  // Assuming status 1 exists
                    department: { connect: { id: '19' } },  // Assuming department ID is 19
                    assignedTo: dmName,
                    files: {
                        cameraFiles: cameraFileUrls,  // Store an array of S3 URLs
                        fileSystemFiles: fileSystemFileUrls,  // Store an array of S3 URLs
                    },
                    user: {
                        connect: {
                            id: req.user.id  // Assuming user authentication middleware is in place
                        }
                    },
                    createdAt: new Date(),
                }
            });
            console.log(newTicket,"ticketnew")

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
