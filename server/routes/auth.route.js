import express from 'express';
const authrouter = express.Router();
import authenticateJWT from '../controllers/user_authentication/authMiddleWare.js';
import register from '../controllers/registeruser/register.js';
import login from '../controllers/user_authentication/login.js';
import logout from '../controllers/user_authentication/logout.js';
import resetPassword from '../controllers/user_authentication/reset_password.js';
import registerUser from '../controllers/registeruser/registerUser.js';
import userData from '../controllers/profile_data/UsersData.js';
import UpdateUser from '../controllers/user_authentication/User.js';
import GetUsers from '../controllers/registeruser/GetUsers.js';

authrouter.post('/register',authenticateJWT, register);
authrouter.post('/login', login);
authrouter.post('/registeruser', authenticateJWT,registerUser)
authrouter.put('/user',authenticateJWT,UpdateUser)

authrouter.post('/logout',authenticateJWT, logout);
authrouter.put('/resetpassword',authenticateJWT, resetPassword);
authrouter.get('/userdata',authenticateJWT,userData)
authrouter.get('/getusers',authenticateJWT,GetUsers)

export default authrouter;
