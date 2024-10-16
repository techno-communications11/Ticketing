import 'bootstrap/dist/css/bootstrap.min.css';
import { Login } from './universalComponents/Login';
import { Profile } from './universalComponents/Profile';
import { Home } from './clientPages/Home';
import { NavbarClient } from './universalComponents/NavbarClient';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { Register } from './AdminPages/Register';
import { SuperAdminHome } from './AdminPages/SuperAdminHome';
import MarketDetailed from './AdminPages/DetailedTickets';
import Opened from './AdminPages/Opened';
import { MarketStructureUpload } from './AdminPages/MarketStructureUpload';
import IndividualTickets from './universalComponents/IndividualTickets';
import UserTickets from './clientPages/UserTickets';
import Users from './AdminPages/Users';
import New from './DistrictManager/New';
import OpenedTickets from './DistrictManager/OpenedTickets';
import Completed from './DistrictManager/Completed';
import  Markethome from './MarketManager/Markethome'
import DepartmentWiseTickets from './Department/DepartmentWiseTickets';
import {jwtDecode} from 'jwt-decode';
import TotalUserTickets from './clientPages/TotalUserTickets';
import DepartmentNew from './Department/DepartmentNew';
import DepartmentHome from './Department/DepartmentHome';
import RequestReopen from './DistrictManager/RequestReopen'
import Tickets_From_Team from './Department/Tickets_From_Team';
import DepartmentOpened from './Department/DepartmentOpened';


const getToken = () => localStorage.getItem('token');
const decodeToken = () => {
  const token = getToken();
  return token ? jwtDecode(token) : null;
};

const superAdminDepartments = ['SuperAdmin'];
const districtManagerDepartments = ['District Manager', 'Employee'];
const marketManagerDepartments = ['Market Manager'];
const departmentDepartments = [
  'NTID Mappings', 'Trainings', 'Accessories Order', 'YUBI Key Setups', 'Deposits', 'Charge Back',
  'Commission', 'Inventory', 'Head Office', 'Admin_Head', 'Maintenance_Head', 'Housing Related',
  'CAM NW', 'HR Payroll','Varun Team','Maintenance Related','Admin Related'
];

const ProtectedRoute = ({ children, allowedDepartments }) => {
  const token = getToken();
  const decodedToken = decodeToken();
  const userDepartment = decodedToken?.department;

  if (!token || !allowedDepartments.includes(userDepartment)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/'; 

  return (
    <>
      {showNavbar && <NavbarClient />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/markethome"
          element={
            <ProtectedRoute allowedDepartments={marketManagerDepartments}>
              <Markethome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departmenthome"
          element={
            <ProtectedRoute allowedDepartments={departmentDepartments}>
              <DepartmentHome />
            </ProtectedRoute>
          }
        />
         <Route
          path="/departmentsfromteam"
          element={
            <ProtectedRoute allowedDepartments={departmentDepartments}>
              <Tickets_From_Team/>
            </ProtectedRoute>
          }
        />
         <Route
          path="/departmentopened"
          element={
            <ProtectedRoute allowedDepartments={departmentDepartments}>
              <DepartmentOpened />
            </ProtectedRoute>
          }
        />
         <Route
          path="/departmentcompleted"
          element={
            <ProtectedRoute allowedDepartments={departmentDepartments}>
              <DepartmentWiseTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departmentnew"
          element={
            <ProtectedRoute allowedDepartments={departmentDepartments}>
              <DepartmentNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedDepartments={[...superAdminDepartments, ...districtManagerDepartments, ...departmentDepartments,...marketManagerDepartments]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superAdminHome"
          element={
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
              <SuperAdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opened"
          element={
            <ProtectedRoute allowedDepartments={[...superAdminDepartments,...marketManagerDepartments]}>
              <Opened />
            </ProtectedRoute>
          }
        />
        <Route
          path="/totalusertickets"
          element={
            <ProtectedRoute allowedDepartments={districtManagerDepartments}>
              <TotalUserTickets />
            </ProtectedRoute>
          }
        />
          <Route
          path="/request-reopen"
          element={
            <ProtectedRoute allowedDepartments={districtManagerDepartments}>
              <RequestReopen/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/details"
          element={
            <ProtectedRoute allowedDepartments={[...superAdminDepartments, ...departmentDepartments, ...marketManagerDepartments, ...districtManagerDepartments]}>
              <IndividualTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketDetailedTicket"
          element={
            <ProtectedRoute allowedDepartments={[...superAdminDepartments, ...districtManagerDepartments]}>
              <MarketDetailed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketstructureupload"
          element={
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
              <MarketStructureUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedDepartments={districtManagerDepartments}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usertickets"
          element={
            <ProtectedRoute allowedDepartments={districtManagerDepartments}>
              <UserTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new"
          element={
            <ProtectedRoute allowedDepartments={['District Manager']}>
              <New />
            </ProtectedRoute>
          }
        />
        <Route
          path="/openedTickets"
          element={
            <ProtectedRoute allowedDepartments={['District Manager']}>
              <OpenedTickets />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/completed"
          element={
            <ProtectedRoute allowedDepartments={['District Manager']}>
              <Completed />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/completed"
          element={
            <ProtectedRoute allowedDepartments={['District Manager']}>
              <Completed/>
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/completedmarket"
          element={
            <ProtectedRoute allowedDepartments={['District Manager']}>
              <Completed />
            </ProtectedRoute>
          }
        /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <div className="App">
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
