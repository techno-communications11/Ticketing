import { FaUserAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Nav } from "react-bootstrap";
const LogoutSection = ({ handleLogout }) => (
    <>
      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
      <Nav.Link as={Link} to="/profile" className="me-5">
        <FaUserAlt />
      </Nav.Link>
    </>
  );
  export default LogoutSection
  