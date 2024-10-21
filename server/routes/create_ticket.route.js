import express from 'express';
import CreateTicket from '../controllers/ticket/create_ticket.js';
import authenticateJWT from '../controllers/user_authentication/authMiddleWare.js';
import TicketCount from '../controllers/ticket/TicketCount.js';
import detailedTicketsWithMarket from '../controllers/ticket/detailedTicketsWithMarket.js';
import TicketDetails from '../controllers/ticket/TicketDetails.js';
import TicketStatus from '../controllers/ticket/TicketStatus.js';
import marketWiseStatus from '../controllers/ticket/marketWiseStatus.js';
import { marketAndStatus } from '../controllers/ticket/marketAndStatus.js';
import  UserTicketCount  from '../controllers/ticket/UserTicketCount.js';
import UserTicketStatus from '../controllers/ticket/UserTicketStatus.js';
import NewTicket from '../controllers/ticket/NewTickets.js';
import UserTotalTickets from '../controllers/ticket/UserTotalTickets.js';
import { fetchAllTickets } from '../controllers/ticket/fetchAllTickets.js';
import comments from '../controllers/ticket/Comments.js';
import getcomment from '../controllers/ticket/GetComments.js';
import assignToDepartment from '../controllers/ticket/assignedToDepartment.js';
import GetMarketTickets from '../controllers/ticket/GetMarketTickets.js';
import GetDepartmentWisetickets from '../controllers/ticket/getDepartmentwiseTickets.js';
import requestReopenTicket from '../controllers/ticket/RequestReopenTicket.js';
import GetRequestReopen from '../controllers/ticket/GetRequestReopen.js';
import Settlement from '../controllers/ticket/Settlement.js';
import updateOpenedBy from '../controllers/ticket/UpdateOpenedBy.js';
import alloted from '../controllers/ticket/alloted.js';
import allDepartCounts from '../controllers/ticket/allDepartCounts.js';
import fetchUserTicketsStats from '../controllers/fetchUserTicketsStats.js'
import User_Insights from '../controllers/ticket/User_insights.js';
import DM_Insights from '../controllers/ticket/Dm_Insights.js';
import GetMarketInsights from '../controllers/ticket/GetMarketInsights.js';

 const createTicketsRouter = express.Router();
 createTicketsRouter.post('/uploadTicket',authenticateJWT,CreateTicket)
 createTicketsRouter.get('/ticketcount',authenticateJWT,TicketCount)
 createTicketsRouter.get('/detailedTickets', authenticateJWT,detailedTicketsWithMarket)
 createTicketsRouter.get('/Ticketdetails', authenticateJWT,TicketDetails)
 createTicketsRouter.put('/updateprogress', authenticateJWT,TicketStatus)
 createTicketsRouter.get('/marketwisestatus',authenticateJWT,marketWiseStatus)
 createTicketsRouter.get('/marketandstatus',authenticateJWT,marketAndStatus)
 createTicketsRouter.get('/countusertickets',authenticateJWT,UserTicketCount)
 createTicketsRouter.get('/userandstatus',authenticateJWT,UserTicketStatus)
 createTicketsRouter.get('/newticket',authenticateJWT,NewTicket)
 createTicketsRouter.get('/all',authenticateJWT,fetchAllTickets)
 createTicketsRouter.get('/usertickets',authenticateJWT,UserTotalTickets)
 createTicketsRouter.put('/postcomment',authenticateJWT,comments)
 createTicketsRouter.put('/assigntodepartment',authenticateJWT,assignToDepartment)
 createTicketsRouter.get('/getcomment',authenticateJWT,getcomment)
 createTicketsRouter.get('/getmarkettickets',authenticateJWT,GetMarketTickets)
 createTicketsRouter.get('/getdepartmenttickets',authenticateJWT,GetDepartmentWisetickets)
 createTicketsRouter.put('/request-reopen', authenticateJWT,requestReopenTicket);
 createTicketsRouter.put('/settlement', authenticateJWT,Settlement);
 createTicketsRouter.get('/get_request_reopen_tickets',authenticateJWT,GetRequestReopen)
 createTicketsRouter.put('/update_opened_by',authenticateJWT,updateOpenedBy)
 createTicketsRouter.put('/alloted',authenticateJWT,alloted)
 createTicketsRouter.get('/alldeptcounts',authenticateJWT,allDepartCounts)
 createTicketsRouter.get('/fetchuserticketsstats',authenticateJWT, fetchUserTicketsStats);
 createTicketsRouter.get('/userinsights',authenticateJWT, User_Insights);
 createTicketsRouter.get('/dminsights',authenticateJWT, DM_Insights);
 createTicketsRouter.get('/getmarketinsights',authenticateJWT, GetMarketInsights);
 
export default createTicketsRouter
