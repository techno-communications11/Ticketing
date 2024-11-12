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
import CompletedMA from './MA_Individual/CompletedMA';
import OpenedMA from './MA_Individual/OpenedMA';
import NewMA from './MA_Individual/NewMA';
import MAhome from './MA_Individual/mAhome'
import MA_head from './Department/MA_head';
import Market_Department from './AdminPages/Market_Department'
import DMTabs from './DistrictManager/DMTabs'
import { MyProvider } from './universalComponents/MyContext';
import Inprogress from './DistrictManager/Inprogress';
import Reopened from './DistrictManager/Reopened';
import DepartmentsInsightsData from './DistrictManager/DepartmentsInsightsData';
import ShowdepartWiseTicks from './AdminPages/ShowdepartWiseTicks';

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
  'CAM NW', 'HR Payroll',
];
const MA_rel=['Maintenance','Admin/Supplies/License/Utilities/Permits/Internet/Telephone/LoomisTechnical/Electricity'];
const MA_New=['Admin_Head', 'Maintenance_Head',]

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
          path="/market&department"
          element={
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
              <Market_Department/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/MAcompleted"
          element={
            <ProtectedRoute allowedDepartments={MA_rel}>
              <CompletedMA />
            </ProtectedRoute>
          }
        />
          <Route
          path="/MAhead"
          element={
            <ProtectedRoute allowedDepartments={MA_New}>
              <MA_head />
            </ProtectedRoute>
          }
        />
        <Route
          path="/MAopened"
          element={
            <ProtectedRoute allowedDepartments={MA_rel}>
              <OpenedMA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/MAhome"
          element={
            <ProtectedRoute allowedDepartments={MA_rel}>
              <MAhome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/MAnew"
          element={
            <ProtectedRoute allowedDepartments={MA_rel}>
              <NewMA />
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
            <ProtectedRoute allowedDepartments={superAdminDepartments}>
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
            <ProtectedRoute allowedDepartments={[...departmentDepartments,...MA_New,...MA_rel]}>
              <DepartmentHome />
            </ProtectedRoute>
          }
        />
         <Route
          path="/departmentsfromteam"
          element={
            <ProtectedRoute allowedDepartments={[...departmentDepartments,...MA_rel]}>
              <Tickets_From_Team/>
            </ProtectedRoute>
          }
        />
         <Route
          path="/departmentopened"
          element={
            <ProtectedRoute allowedDepartments={[...departmentDepartments,...MA_New,...MA_rel]}>
              <DepartmentOpened />
            </ProtectedRoute>
          }
        />
         <Route
          path="/departmentcompleted"
          element={
            <ProtectedRoute allowedDepartments={[...departmentDepartments,...MA_New,,...MA_rel]}>
              <DepartmentWiseTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departmentnew"
          element={
            <ProtectedRoute allowedDepartments={[...departmentDepartments,...MA_rel]}>
              <DepartmentNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedDepartments={[...MA_New,...MA_rel,...superAdminDepartments, ...districtManagerDepartments, ...departmentDepartments,...marketManagerDepartments]}>
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
            <ProtectedRoute allowedDepartments={[...districtManagerDepartments,...superAdminDepartments]}>
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
            <ProtectedRoute allowedDepartments={[...MA_New,...MA_rel,...superAdminDepartments, ...departmentDepartments, ...marketManagerDepartments, ...districtManagerDepartments]}>
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
            <ProtectedRoute allowedDepartments={['District Manager','SuperAdmin']}>
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
