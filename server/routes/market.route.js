import express from 'express';
import authenticateJWT from '../controllers/user_authentication/authMiddleWare.js';
import { StoreMarket } from '../controllers/ticket/StoreMarket.js';
import MarketStructure from '../controllers/registeruser/MarketStructure.js';
import adminMarket from '../controllers/ticket/adminMarkets.js';
import registerMarket from '../controllers/registeruser/registerMarket.js';

const marketRouter=express.Router();
marketRouter.post('/excelsheet', authenticateJWT,MarketStructure)
marketRouter.post('/registermarket',registerMarket)
marketRouter.get('/getmarkets',adminMarket)
marketRouter.get('/getstoremarket',authenticateJWT,StoreMarket)



export default marketRouter