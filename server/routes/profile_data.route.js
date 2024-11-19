import express from 'express'
import GetProfileData_NTID from '../controllers/profile_data/profileData_Ntid.js';

import ProfilePhoto from '../controllers/profile_data/profile_photo.js';
import authenticateJWT from '../controllers/user_authentication/authMiddleWare.js';
import GetProfileData_token from '../controllers/profile_data/profileData_token.js';
import getProfilePhoto from '../controllers/profile_data/getProfilePhoto.js';
// import getTicketFiles from '../controllers/ticket/getTicketFiles.js';



const ProfilephotoRouter=express.Router();


ProfilephotoRouter.get('/getprofiledata_token',authenticateJWT,GetProfileData_token)
ProfilephotoRouter.get('/getprofiledata_ntid',authenticateJWT,GetProfileData_NTID)
ProfilephotoRouter.post('/profilephoto',authenticateJWT,ProfilePhoto)
ProfilephotoRouter.get('/getprofilephoto',authenticateJWT,getProfilePhoto)
// ProfilephotoRouter.get('/getticketfiles',authenticateJWT,getTicketFiles)



export default ProfilephotoRouter
