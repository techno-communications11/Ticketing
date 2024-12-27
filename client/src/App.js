import 'bootstrap/dist/css/bootstrap.min.css';
import {Login}  from './universalComponents/Login';
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
import Market_Department from './AdminPages/Market_Department'
import DMTabs from './DistrictManager/DMTabs'
import { MyProvider } from './universalComponents/MyContext';
import Inprogress from './DistrictManager/Inprogress';
import Reopened from './DistrictManager/Reopened';
import DepartmentsInsightsData from './DistrictManager/DepartmentsInsightsData';
import ShowdepartWiseTicks from './AdminPages/ShowdepartWiseTicks';
import { AdminTicketCreate } from './AdminPages/AdminTicketCreate';
import {DmsCreateTicket} from './DistrictManager/DmsCreateTicket';
import GetAllDeptTickets from './Department/GetAllDeptTickets';
import TicketNowAtData from './AdminPages/TicketNowAtData';


const getToken = () => localStorage.getItem('token');
const decodeToken = () => {
  const token = getToken();
  return token ? jwtDecode(token) : null;
};

const superAdminDepartments = ['SuperAdmin'];
const districtManagerDepartments = ['District Manager', 'Employee'];
const marketManagerDepartments = ['Market Manager'];
const departmentDepartments = [
  'NTID Mappings', 'Trainings', 'Accessories Order', 'YUBI Key Setups',  'Charge Back/Commission',
   'Inventory',  'Housing',
  'CAM NW', 'HR Payroll','Maintenance','Admin',"Software"
];

const ProtectedRoute = ({ children, allowedDepartments }) => {
  const token = getToken();
  const decodedToken = decodeToken();
  const userDepartment = decodedToken?.department;

  if (!token || !allowedDepartments?.includes(userDepartment)) {
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
          path="/admincreateticket"
          element={
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
              <AdminTicketCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/market&department"
          element={
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
              <Market_Department/>
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
          path="/register"
          element={
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
              <Register />
            </ProtectedRoute>
          }
        />
         <Route
          path="/showdeptwiseticks"
          element={
            <ProtectedRoute allowedDepartments={[...superAdminDepartments,...departmentDepartments]}>
              <ShowdepartWiseTicks />
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
          path="/getalldepartmenttickets"
          element={
            <ProtectedRoute allowedDepartments={departmentDepartments}>
              <GetAllDeptTickets />
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
          path="/dmcreateticket"
          element={
            <ProtectedRoute allowedDepartments={districtManagerDepartments}>
              <DmsCreateTicket />
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
            <ProtectedRoute allowedDepartments={[...departmentDepartments,...superAdminDepartments, ...districtManagerDepartments,...marketManagerDepartments]}>
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
          path="/ticketnowatdata"
          element={
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
              <TicketNowAtData />
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
            <ProtectedRoute allowedDepartments={[...districtManagerDepartments,...superAdminDepartments]}>
              <TotalUserTickets />
            </ProtectedRoute>
          }
        />
          <Route
          path="/request-reopen"
          element={
            <ProtectedRoute allowedDepartments={[...districtManagerDepartments,...departmentDepartments]}>
              <RequestReopen/>
            </ProtectedRoute>
          }
        />
         <Route
          path="/inprogress"
          element={
            <ProtectedRoute allowedDepartments={districtManagerDepartments}>
              <Inprogress/>
            </ProtectedRoute>
          }
        />
         <Route
          path="/reopened"
          element={
            <ProtectedRoute allowedDepartments={districtManagerDepartments}>
              <Reopened/>
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
          path="/distinsights"
          element={
            <ProtectedRoute allowedDepartments={[ ...departmentDepartments,...districtManagerDepartments,...superAdminDepartments,]}>
              <DepartmentsInsightsData />
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
          path="/usertickets"
          element={
            <ProtectedRoute allowedDepartments={[...districtManagerDepartments,...superAdminDepartments]}>
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
        
        <Route
          path="/completed"
          element={
            <ProtectedRoute allowedDepartments={['District Manager']}>
              <Completed/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dmtabs"
          element={
            <ProtectedRoute allowedDepartments={['District Manager',"SuperAdmin"]}>
              <DMTabs/>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <div className="App">
      <MyProvider>
      <Router>
        <AppContent />
      </Router>
      </MyProvider>
    </div>
  );
}

export default App;
