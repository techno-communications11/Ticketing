import { TbEyeCheck } from "react-icons/tb";
import { MdAssignmentTurnedIn } from "react-icons/md";
import { MdOutlineDoneAll } from "react-icons/md";
import { GoIssueReopened } from "react-icons/go";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { VscGitPullRequestNewChanges } from "react-icons/vsc";
import { FaTicket } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";
const NavLinks = ({ department, pathname, isDepartments }) => (
    <>

{ department==='District Manager'&&<Nav.Link
        as={Link}
        to={department === "District Manager" ? "/dmcreateticket" : "/"}
        className={`fw-medium position-relative ${pathname === "/dmcreateticket" ? "text-danger fw-bolder" : "text-dark"}`}
      >
        <FaTicket className="text-danger fs-5" /> Create Ticket
      </Nav.Link>}

      <Nav.Link
        as={Link}
        to={department === "District Manager" ? "/openedTickets" : isDepartments ? "/departmentopened" : "/"}
        className={`fw-medium position-relative ${pathname === "/openedTickets" || pathname === "/departmentopened" ? "text-danger fw-bolder" : "text-dark"}`}
      >
        <TbEyeCheck className="text-primary fs-5" /> Viewed
      </Nav.Link>
  
      {department==='District Manager' && <Nav.Link
        as={Link}
        to={department === "District Manager" ? "/inprogress" : "/"}
        className={`fw-medium position-relative ${pathname === "/inprogress" ? "text-danger fw-bolder" : "text-dark"}`}
      >
        <MdAssignmentTurnedIn className="text-warning fs-5" /> Assigned
      </Nav.Link>}
  
      <Nav.Link
        as={Link}
        to={department === "District Manager" ? "/completed" : isDepartments ? "/departmentcompleted" : "/"}
        className={`fw-medium position-relative ${pathname === "/completed" || pathname === "/departmentcompleted" ? "text-danger fw-bolder" : "text-dark"}`}
      >
        <MdOutlineDoneAll className="text-success fs-5" /> Completed
      </Nav.Link>
  
      {department === "District Manager" && (
        <Nav.Link
          as={Link}
          to={department === "District Manager" ? "/request-reopen" : "/"}
          className={`fw-medium position-relative ${pathname === "/request-reopen" ? "text-danger fw-bolder" : "text-dark"}`}
        >
          <VscGitPullRequestNewChanges className="fs-5 fw-bolder text-danger" /> ReopenQuest
        </Nav.Link>
      )}
  
      {department==='District Manager'&&<Nav.Link
        as={Link}
        to={department === "District Manager" ? "/reopened" : "/"}
        className={`fw-medium position-relative ${pathname === "/reopened" ? "text-danger fw-bolder" : "text-dark"}`}
      >
        <GoIssueReopened className="text-primary fs-5 fw-bolder" /> Reopened
      </Nav.Link>}
      {isDepartments && (
  <Nav.Link
    as={Link}
    to={isDepartments ? "/departmentsfromteam" : "/"}
    className={`fw-medium position-relative ${pathname === "/departmentsfromteam" ? "text-danger fw-bolder" : "text-dark"}`}
  >
    <FaUsers className="text-primary fs-5 fw-bolder" /> Team Tickets
  </Nav.Link>
)}

    </>
  );
  export default NavLinks
  