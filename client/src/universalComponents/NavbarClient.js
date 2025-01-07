import { apiRequest } from "../lib/apiRequest";
import { Container, Navbar, Nav, NavbarBrand } from "react-bootstrap";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {  useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseTickets } from "../redux/statusSlice";
import { useLocation } from "react-router-dom";
import "../styles/TicketTable.css";
import { useNavigate } from "react-router-dom";
import { MdInsights } from "react-icons/md";


import LogoutSection from "./LogoutSection";
import NavLinks from "./NavLinks";
import SuperAdminLinks from "./SuperAdminLinks";
export function NavbarClient() {
  const dispatch = useDispatch();
  const [deptcount, setTickets] = useState([]);
  const [ticketCount, setTicketCount] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { department, id: userId, ntid } = token ? jwtDecode(token) : {};
  const { pathname } = useLocation();

  const handleLogout = async () => {
    // Add a fade-out effect or some UI indication before logout
    document.body.classList.add("fade-out"); // Add a CSS class for transition
    setTimeout(() => {
      localStorage.clear();
      navigate("/login");
    }, 500); // Adjust timeout to match the CSS transition duration
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
    "Reporting"
  ]?.includes(department);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!userId) return;
      try {
        const statuseIds = ["1"];
        const ticketPromises = statuseIds.map((statusId) =>
          dispatch(fetchStatusWiseTickets({ id: userId, statusId }))
        );
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
        const response = await apiRequest.get(
          "/createTickets/getdepartmenttickets",
          {
            params: { ntid },
          }
        );
        const fetchedTickets = response.data.filter(
          (ticket) =>
            ticket.openedBy === null &&ticket.completedAt===null&&
            ticket.assignToTeam === null 
            // ticket.status.id === "5"||ticket.status.id==='3'||ticket.status.id==='1'
        );
        setTickets(fetchedTickets);
        
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      }
    };
    fetchUserTickets();
  }, [userId, ntid]);

  const isEmployeedepartment = ["Employee"]?.includes(department);
  const homeRoute = isEmployeedepartment
    ? "/home"
    : department === "District Manager"
    ? "/dmtabs"
    : isDepartments
    ? "/departmenthome"
    : department === "Market Manager"
    ? "/markethome"
    : department==="Internal"?"admincreateticket":"/superAdminHome";

  return (
    <Navbar expand="lg" className="shadow-sm">
  <Container fluid>
    <NavbarBrand as={Link} to={homeRoute} className="d-flex mb-2">
      <img srcSet="../logo.webp" loading="lazy" height={35} alt="Logo" />
      <Nav className="me-auto" navbarScroll>
        <Navbar.Brand
          as={Link}
          to={homeRoute}
          className="fw-medium text-dark ms-2 fs-6"
          style={{ fontSize: "90%" }}
        >
          TECHNO COMMUNICATIONS LLC
        </Navbar.Brand>
      </Nav>
    </NavbarBrand>
    <Navbar.Toggle
      aria-controls="navbarScroll"
      className="fs-6 shadow-none border-0 mb-3"
    />
    <Navbar.Collapse id="navbarScroll">
      <Nav className="ms-auto d-flex flex-column flex-lg-row">
        {token ? (
          <>
            {(department === "District Manager" || isDepartments) && (
              <div className="d-md-flex align-items-start me-2 text-dark">
                <div className="d-flex">
                  <Nav.Link
                    as={Link}
                    to={department === "District Manager" ? "/new" : isDepartments ? "/departmentnew" : "/"}
                    className="d-flex align-items-center fw-medium position-relative"
                    style={{
                      background: "linear-gradient(90deg, rgba(63,94,251,1) 0%, rgba(180,27,148,1) 81%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    New
                  </Nav.Link>
                  <span
                    className="badge bg-danger text-white fw-medium rounded-circle"
                    style={{
                      width: "23px",
                      height: "21px",
                      position: "relative",
                      bottom: "3px",
                      right: "10px",
                    }}
                  >
                    {department === "District Manager" ? ticketCount : deptcount.length}
                  </span>
                </div>

                <NavLinks
                  department={department}
                  pathname={pathname}
                  isDepartments={isDepartments}
                />
              </div>
            )}

            {department === "SuperAdmin" && (
              <>
                <Nav.Link
                  as={Link}
                  to="/market&department"
                  className={pathname === "/market&department" ? "text-danger fw-bolder" : "text-dark"}
                >
                  <MdInsights className="text-primary fs-3" /> Insights
                </Nav.Link>
                <SuperAdminLinks pathname={pathname} />
              </>
            )}

            <LogoutSection handleLogout={handleLogout} />
          </>
        ) : (
          <Nav.Link as={Link} to="/login" className="me-5">
            Login
          </Nav.Link>
        )}
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>

  );
}
