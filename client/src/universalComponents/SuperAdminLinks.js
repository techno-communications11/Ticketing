
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaTicketAlt } from "react-icons/fa";
import { MdStorefront } from "react-icons/md";
const SuperAdminLinks = ({ pathname }) => (
    <>
      <Nav.Link
        as={Link}
        to="/admincreateticket"
        className={`fw-medium position-relative ${pathname === "/admincreateticket" ? "text-danger fw-bolder" : "text-dark"}`}
      >
        <FaTicketAlt className="text-danger fs-4" /> Create Ticket
      </Nav.Link>
  
      <Nav.Link
        as={Link}
        to="/marketstructureupload"
        className={`fw-medium position-relative ${pathname === "/marketstructureupload" ? "text-danger fw-bolder" : "text-dark"}`}
      >
        <MdStorefront className="text-warning fs-4" /> StoreEnroll
      </Nav.Link>
  
      <Nav.Link
        as={Link}
        to="/register"
        className={`fw-medium position-relative ${pathname === "/register" ? "text-danger fw-bolder" : "text-dark"}`}
      >
        <FaUser className="text-success fs-6 fw-bolder" /> UserEnroll
      </Nav.Link>
  
      <Nav.Link
        as={Link}
        to="/users"
        className={`fw-medium position-relative ${pathname === "/users" ? "text-danger fw-bolder" : "text-dark"}`}
      >
        <FaUsers className="text-success fs-5" /> Users
      </Nav.Link>
    </>
  );
  export default SuperAdminLinks