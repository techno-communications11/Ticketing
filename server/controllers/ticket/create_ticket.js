import uploadImages from "../../multer/imageUpload.js";
import prisma from "../lib/prisma.js";
import { uploadToS3 } from "../../multer/imageUpload.js";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

const createTicket = async (req, res) => {
    uploadImages.fields([{ name: 'cameraFile', maxCount: 5 }, { name: 'fileSystemFile', maxCount: 5 }])(req, res, async (err) => {
        if (err) {
            console.error("Multer error: ", err);
            return res.status(400).send('Error uploading files.');
        }

        if (!req.files || !req.body) {
            return res.status(400).send('No files or form data uploaded.');
        }

        const { ntid, fullname, phone, market, store, department, subdepartment, departmentId, ticketSubject, description } = req.body;

        try {
            // Fetch department manager details
            const dmData = await prisma.marketStructure.findMany({
                where: { storeName: store },
                select: { dmName: true }
            });

            if (!dmData || dmData.length === 0) {
                return res.status(404).send('Department Manager not found for the selected store.');
            }

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
            
            // Handle departmentId and assignedTo
            let departmentConnect;
            let assignedToValue = "";
            
            if (!departmentId || typeof departmentId !== "string" || departmentId.trim() === "") {
                // Use department manager when no departmentId is provided
                assignedToValue = dmData[0].dmName || "";
                departmentConnect = { connect: { id: "19" } };
            } else {
                const deprId = await prisma.department.findUnique({
                    where: { name: departmentId.trim() },
                });
                
                departmentConnect = deprId ? { connect: { id: deprId.id } } : { connect: { id: "19" } };
            }

            // Fetch email recipients
            let emailRecipients = [];
            if (departmentConnect.connect.id === "19") {
                const dmEmails = await prisma.user.findFirst({
                    where: { fullname: assignedToValue },
                    select: { ntid: true }
                });
                if (dmEmails) emailRecipients.push(dmEmails.ntid);
            } else {
                const deptEmails = await prisma.user.findMany({
                    where: { departmentId: departmentConnect.connect.id },
                    select: { ntid: true }
                });
                emailRecipients = deptEmails.map(user => user.ntid);
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
                    assignedTo: assignedToValue,
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
                }
            });

            const emailBody = `
                <h1 style="font-family: Arial, sans-serif; color: #333;">TECHNO-COMMUNICATIONS LLC</h1>
                <img src="https://ticketing.techno-communications.com/logoT.webp" alt="Logo" style="width:150px;height:auto;">
                <p>Dear User,</p>
                <p>Ticket with ID <strong>${TicketId}</strong></p>
                <p>Ticket created By <strong>${newTicket.fullname}</strong></p>
                <p>Department Choosed By the User: <strong>${newTicket.selectedDepartment || "Unknown"}</strong></p>
                <p>Sub-department: <strong>${newTicket.selectedSubdepartment || "Unknown"}</strong></p>
                <p>Ticket Subject: <strong>${newTicket.ticketRegarding || "Unknown"}</strong></p>
                <p> Ticket Description: <strong>${newTicket.description || "Unknown"}</strong></p>
                <p>Thank you!</p>
                <a href="https://ticketing.techno-communications.com/" style="padding:10px 20px;background-color:#007BFF;color:white;border-radius:5px;text-decoration:none;">Open Ticket</a>
            `;

            if (emailRecipients.length > 0) {
                try {
                    await resend.emails.send({
                        from: "ticketing@techno-communications.com",
                        to: emailRecipients,
                        subject: `Ticket ${TicketId} Assigned To You`,
                        html: emailBody,
                    });
                } catch (emailError) {
                    console.error("Error sending email:", emailError.message);
                }
            }

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