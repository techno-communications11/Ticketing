import { apiRequest } from '../lib/apiRequest';
import { Container, Navbar, Nav, NavbarBrand } from 'react-bootstrap';
import { FaUserAlt } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchStatusWiseTickets } from '../redux/statusSlice';

export function NavbarClient() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [deptcount, setTickets] = useState([]);

  const [ticketCount, setTicketCount] = useState(0);
  const token = localStorage.getItem('token');
  const { department, id: userId, ntid,fullname } = token ? jwtDecode(token) : {};

  const handleLogout = async () => {
    try {
      const response = await apiRequest.post('/auth/logout', {}, { withCredentials: true });
      if (response.status === 200) {
        localStorage.clear();
        window.location.href = '/login'; // Navigate and reload
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const isDepartments = ['Varun Team', 'NTID Mappings', 'Trainings', 'Accessories Order', 'YUBI Key Setups', 'Deposits', 'Charge Back', 'Commission', 'Inventory', 'Head Office', 'Admin Related', 'Maintenance Related', 'Housing Related', 'CAM NW', 'HR Payroll'].includes(department);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!userId) return;

      try {
        const statuseIds = ['1', '5'];
        const ticketPromises = statuseIds.map(statusId => dispatch(fetchStatusWiseTickets({ id: userId, statusId })));
        const ticketResponses = await Promise.all(ticketPromises);

        const totalTickets = ticketResponses.reduce((total, response) => {
          return total + (response.payload?.length || 0);
        }, 0);

        setTicketCount(totalTickets);
        localStorage.setItem("NewCount", totalTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [dispatch, userId]);

  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        const response = await apiRequest.get('/createTickets/getdepartmenttickets', {
          params: { ntid, statusId: '3' }
        });
        const fetchedTickets = response.data.filter(ticket => ticket.openedBy === null&& ticket.status.name!=='completed');
        setTickets(fetchedTickets);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      }
    };
    fetchUserTickets();
  }, [userId, ntid]);

  const isEmployeedepartment = ['Employee', 'District Manager'].includes(department);
  const homeRoute = isEmployeedepartment
    ? '/home'
    : isDepartments
      ? '/departmentHome'
      : department === 'Market Manager'
        ? '/markethome'
        : '/superAdminHome';

  return (
    <Navbar expand="lg" className="shadow-sm">
      <Container fluid>
        <NavbarBrand as={Link} to={homeRoute}>
          <img src='../logo.png' height={30} alt="Logo" />
        </NavbarBrand>

        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Navbar.Brand as={Link} to={homeRoute} className='fw-bolder text-dark' style={{ fontSize: '90%' }}>
              TECHNO COMMUNICATIONS LLC
            </Navbar.Brand>
          </Nav>
          <Nav className='ms-auto'>
            {token ? (
              <>
                {(department === 'District Manager' || isDepartments) && (
                  <div className='d-flex align-items-center me-5'>
                    <Nav.Link
                      as={Link}
                      to={department === 'District Manager' ? '/new' : '/departmentnew'}
                      className='fw-bolder position-relative'
                      style={{
                        background: 'linear-gradient(90deg, rgba(63,94,251,1) 0%, rgba(180,27,148,1) 81%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      New
                    </Nav.Link>
                    <span className='badge bg-danger text-white fw-bolder rounded-circle d-flex align-items-center justify-content-center'
                      style={{
                        width: '23px',
                        height: '21px',
                        position: 'relative',
                        bottom: '2px',
                        right: '10px'
                      }}>
                      {department === 'District Manager' ? ticketCount : deptcount.length}
                    </span>
                    {!isDepartments && <Nav.Link as={Link} to='/openedTickets' className='fw-bolder position-relative'>
                      Opened
                    </Nav.Link>}
                   {
                    department !== 'District Manager'&&
                     <Nav.Link as={Link} to={isDepartments ? '/departmentopened ' : '/'} className='fw-bolder position-relative'>
                     Opened
                   </Nav.Link>
                   }
                    <Nav.Link as={Link} to={department === 'District Manager' ? '/completed ' : 'departmentcompleted'} className='fw-bolder position-relative'>
                      Completed
                    </Nav.Link>
                    {!isDepartments && <Nav.Link as={Link} to={department === 'District Manager' ? '/request-reopen' : '/'} className='fw-bolder position-relative'>
                      Request Reopen
                    </Nav.Link>}

                    {
                      department !== 'District Manager'&&
                      <Nav.Link as={Link} to={isDepartments ? '/departmentsfromteam ' : '/'} className='fw-bolder position-relative'>
                      Tickets-From-Team
                    </Nav.Link>
                    }
                  </div>
                )}
                {department === "SuperAdmin" && (
                  <>
                    <Nav.Link as={Link} to='/marketstructureupload' className='me-2 fw-bolder text-black'>
                      Register market
                    </Nav.Link>
                    <Nav.Link as={Link} to='/register' className='me-2 fw-bolder text-black'>
                      Register user
                    </Nav.Link>
                    <Nav.Link as={Link} to='/users' className='me-2 fw-bolder text-black'>
                      Users
                    </Nav.Link>
                  </>
                )}
                <button className='btn btn-danger me-3' onClick={handleLogout}>Logout</button>
                <Nav.Link as={Link} to='/profile' className='me-5'>
                  <FaUserAlt />
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to='/login' className='me-5'>
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
