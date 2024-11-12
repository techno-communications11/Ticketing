import uploadImages from '../../multer/imageUpload.js';
import prisma from '../lib/prisma.js';

const createTicket = async (req, res) => {
    uploadImages.fields([{ name: 'cameraFile', maxCount: 1 }, { name: 'fileSystemFile', maxCount: 1 }])(req, res, async (err) => {
        if (err) {
            return res.status(400).send('Error uploading files.');
        }

        if (!req.files || !req.body) {
            return res.status(400).send('No files or form data uploaded.');
        }

        const { ntid, fullname, phone, market, store, department, ticketSubject, description } = req.body;
        console.log(req.body,"uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");  
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

            const cameraFile = req.files['cameraFile'] ? req.files['cameraFile'][0] : null;
            const fileSystemFile = req.files['fileSystemFile'] ? req.files['fileSystemFile'][0] : null;

            const currentDate = new Date();
            const TicketId = ntid + currentDate.getUTCFullYear() +
                ("0" + (currentDate.getUTCMonth() + 1)).slice(-2) +
                ("0" + currentDate.getUTCDate()).slice(-2) +
                ("0" + currentDate.getUTCHours()).slice(-2) +
                ("0" + currentDate.getUTCMinutes()).slice(-2) +
                ("0" + currentDate.getUTCSeconds()).slice(-2);


            // Create a new ticket
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
                    status: { connect: { id: '1' } }, 
                    department: { connect: { id: '19' } },
                    assignedTo: dmName,
                    files: JSON.stringify({
                        cameraFile: cameraFile ? cameraFile.path : null,
                        fileSystemFile: fileSystemFile ? fileSystemFile.path : null
                    }),
                    user: {
                        connect: {
                            id: req.user.id
                        }
                    },
                    createdAt: new Date()
                }
            });

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
