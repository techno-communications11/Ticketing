import { apiRequest } from '../lib/apiRequest';
import { Container, Navbar, Nav, NavbarBrand } from 'react-bootstrap';
import { FaUserAlt } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchStatusWiseTickets } from '../redux/statusSlice';

export function NavbarClient() {
  const dispatch = useDispatch();
  const [deptcount, setTickets] = useState([]);
  const [ticketCount, setTicketCount] = useState(0);
  const token = localStorage.getItem('token');
  const { department, id: userId, ntid } = token ? jwtDecode(token) : {};

  const handleLogout = async () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const isDepartments = ['NTID Mappings', 'Trainings',
    'Accessories Order', 'YUBI Key Setups', 'Charge Back/Commission',
    'Inventory', 'Housing', 'CAM NW', 'HR Payroll']?.includes(department);
  const ma_rel = ['Maintenance', 'Admin/Supplies/License/Utilities/Permits/Internet/Telephone/LoomisTechnical/Electricity']?.includes(department);
  const MA_New = ['Admin_Head', 'Maintenance_Head']?.includes(department);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!userId) return;
      try {
        const statuseIds = ['1'];
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
        const fetchedTickets = response.data.filter(ticket =>
          ticket.openedBy === null
          && ticket.assignToTeam === null
          && ticket.status.name !== 'completed');
        setTickets(fetchedTickets);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      }
    };
    fetchUserTickets();
  }, [userId, ntid]);

  const isEmployeedepartment = ['Employee', 'District Manager']?.includes(department);
  const homeRoute = isEmployeedepartment
    ? '/home'
    : isDepartments
      ? '/departmenthome'
      : department === 'Market Manager'
        ? '/markethome'
        : ma_rel ? '/MAhome' : MA_New ? '/departmenthome' : '/superAdminHome';

  return (
    <Navbar expand="lg" className="shadow-sm">
      <Container fluid>
        <NavbarBrand as={Link} to={homeRoute} className='d-flex mb-2'>
          <img src='../logo.png' height={40} alt="Logo" />
          <Nav className="me-auto" navbarScroll>
            <Navbar.Brand as={Link} to={homeRoute} className='fw-medium text-dark ms-2 fs-6' style={{ fontSize: '90%' }}>
              TECHNO COMMUNICATIONS LLC
            </Navbar.Brand>
          </Nav>
        </NavbarBrand>
        <Navbar.Toggle aria-controls="navbarScroll" className='fs-6 shadow-none border-0 mb-3' />
        <Navbar.Collapse id="navbarScroll">

          <Nav className='ms-auto d-flex flex-column flex-lg-row'>
            {token ? (
              <>
                {(department === 'District Manager' || isDepartments || ma_rel || MA_New) && (
                  <div className='d-md-flex align-items-start me-2 text-dark'>
                    <div className='d-flex'>
                      <Nav.Link
                        as={Link}
                        to={
                          department === 'District Manager'
                            ? '/new'
                            : isDepartments
                              ? '/departmentnew'
                              : ma_rel
                                ? '/MAnew'
                                : MA_New
                                  ? '/MAhead'
                                  : '/'
                        }
                        className="d-flex align-items-center fw-medium position-relative "
                        style={{
                          background: 'linear-gradient(90deg, rgba(63,94,251,1) 0%, rgba(180,27,148,1) 81%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        New
                      </Nav.Link>
                      <span
                        className="badge bg-danger text-white fw-medium rounded-circle"
                        style={{
                          width: '23px',
                          height: '21px',
                          position: 'relative',
                          bottom: '3px',
                          right: '10px'
                        }}
                      >
                        {department === 'District Manager' ? ticketCount : deptcount.length}
                      </span>

                    </div>

                    {!isDepartments && !ma_rel && !MA_New && <Nav.Link as={Link} to='/openedTickets' className='fw-medium position-relative text-dark'>
                      Opened
                    </Nav.Link>}
                    {
                      department !== 'District Manager' &&
                      <Nav.Link as={Link} to={isDepartments ? '/departmentopened' : ma_rel ? '/MAopened' : MA_New ? '/departmentopened' : '/'} className='fw-medium position-relative text-dark'>
                        Opened
                      </Nav.Link>
                    }
                    {!ma_rel && !isDepartments && !MA_New && <Nav.Link as={Link} to={department === 'District Manager' ? '/inprogress' : '/'} className='fw-medium position-relative text-dark'>
                      Assigned
                    </Nav.Link>}
                    <Nav.Link as={Link} to={department === 'District Manager' ? '/completed' : isDepartments ? '/departmentcompleted' : ma_rel ? '/MAcompleted' : MA_New ? '/departmentcompleted' : '/'} className='fw-medium position-relative text-dark'>
                      Completed
                    </Nav.Link>
                    {!ma_rel && !isDepartments && !MA_New && <Nav.Link as={Link} to={department === 'District Manager' ? '/request-reopen' : '/'} className='fw-medium position-relative text-dark'>
                      ReopenQuest
                    </Nav.Link>}
                    
                    {!ma_rel && !isDepartments && !MA_New && <Nav.Link as={Link} to={department === 'District Manager' ? '/reopened' : '/'} className='fw-medium position-relative text-dark'>
                     reopened
                    </Nav.Link>}
                    {
                      !ma_rel && department !== 'District Manager' && department !== 'Maintenance_Head' && department !== 'Admin_Head' &&
                      <Nav.Link as={Link} to={isDepartments ? '/departmentsfromteam' : '/'} className='fw-medium position-relative text-dark'>
                        TeamTickets
                      </Nav.Link>
                    }
                  </div>
                )}
                 {(department==='District Manager'||department==='SuperAdmin')&&(<Nav.Link as={Link} to={department==='SuperAdmin'?'/market&department':department==='District Manager'?'/dmtabs':'/'} className='me-2 fw-medium text-dark'>
                      Insights
                    </Nav.Link>)}
                {department === "SuperAdmin" && (
                  <Nav>
                   
                    <Nav.Link as={Link} to='/marketstructureupload' className='me-2 fw-medium text-dark'>
                      MarketEnroll
                    </Nav.Link>
                    <Nav.Link as={Link} to='/register' className='me-2 fw-medium text-dark'>
                      UserEnroll
                    </Nav.Link>
                    <Nav.Link as={Link} to='/users' className='me-2 fw-medium text-dark'>
                      Users
                    </Nav.Link>
                  </Nav>
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
