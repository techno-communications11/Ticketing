import { apiRequest } from "../lib/apiRequest";
import { Container, Navbar, Nav, NavbarBrand, Badge } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseTickets } from "../redux/statusSlice";
import { MdInsights } from "react-icons/md";
import LogoutSection from "./LogoutSection";
import NavLinks from "./NavLinks";
import SuperAdminLinks from "./SuperAdminLinks";
import "../styles/NavbarClient.css"; // New custom CSS file

export function NavbarClient() {
  const dispatch = useDispatch();
  const [deptCount, setDeptCount] = useState([]);
  const [ticketCount, setTicketCount] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Safely decode token with fallback
  const decodedToken = token ? jwtDecode(token) : { department: null, id: null, ntid: null };
  const { department, id: userId, ntid } = decodedToken;

  const handleLogout = () => {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      localStorage.clear();
      navigate("/login");
      document.body.classList.remove("fade-out");
    });
  };

  const isDepartments = [
    "NTID Mappings",
    "Trainings",
    "Accessories Order",
    "YUBI Key Setups",
    "Commission",
    "Inventory",
    "Housing",
    "CAM NW",
    "HR Payroll",
    "Maintenance",
    "Admin",
    "Software India",
    "Reporting",
  ].includes(department);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!userId) return;
      try {
        const statusIds = ["1"]; // New tickets
        const ticketPromises = statusIds.map((statusId) =>
          dispatch(fetchStatusWiseTickets({ id: userId, statusId }))
        );
        const ticketResponses = await Promise.all(ticketPromises);
        const totalTickets = ticketResponses.reduce(
          (total, response) => total + (response.payload?.length || 0),
          0
        );
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
      if (!ntid) return;
      try {
        const response = await apiRequest.get("/createTickets/getdepartmenttickets", {
          params: { ntid },
        });
        const fetchedTickets = response.data.filter(
          (ticket) =>
            ticket.status.id === "1" 
        ); // New, In Progress, Reopened
        setDeptCount(fetchedTickets);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      }
    };
    fetchUserTickets();
  }, [ntid]);

  const isEmployeeDepartment = ["Employee"].includes(department);
  const homeRoute = isEmployeeDepartment
    ? "/home"
    : department === "District Manager"
    ? "/dmtabs"
    : isDepartments
    ? "/departmenthome"
    : department === "Market Manager"
    ? "/markethome"
    : department === "Internal"
    ? "/admincreateticket"
    : "/superAdminHome";

  return (
    <Navbar expand="lg" className="navbar-custom shadow-sm">
      <Container fluid>
        <NavbarBrand as={Link} to={homeRoute} className="d-flex align-items-center">
          <img src="../logo.webp" loading="lazy" height={35} alt="Logo" className="me-2" />
          <span className="fw-medium text-dark fs-6">TECHNO COMMUNICATIONS LLC</span>
        </NavbarBrand>
        <Navbar.Toggle aria-controls="navbarScroll" className="navbar-toggle-custom" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="ms-auto d-flex align-items-center gap-3">
            {token && (
              <>
                {(department === "District Manager" || isDepartments) && (
                  <div className="d-flex align-items-center gap-none">
                    <Badge
                        bg="danger"
                        className="  rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "20px", height: "20px", fontSize: "12px",}}
                      >
                        {department === "District Manager" ? ticketCount : deptCount.length}
                      </Badge>
                    <Nav.Link
                      as={Link}
                      to={department === "District Manager" ? "/new" : "/departmentnew"}
                      className="nav-link-custom position-relative me-2"
                    >
                      New
                      
                    </Nav.Link>
                    <NavLinks department={department} pathname={pathname} isDepartments={isDepartments} />
                  </div>
                )}

                {department === "SuperAdmin" && (
                  <>
                    <Nav.Link
                      as={Link}
                      to="/market&department"
                      className={`d-flex align-items-center gap-1 ${
                        pathname === "/market&department" ? "text-pink fw-bold" : "text-dark"
                      }`}
                    >
                      <MdInsights className="text-primary fs-4" />
                      Insights
                    </Nav.Link>
                    <SuperAdminLinks pathname={pathname} />
                  </>
                )}

                <LogoutSection handleLogout={handleLogout} />
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarClient;