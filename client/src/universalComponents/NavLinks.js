import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { TbEyeCheck } from "react-icons/tb";
import { MdAssignmentTurnedIn, MdOutlineDoneAll } from "react-icons/md";
import { GoIssueReopened } from "react-icons/go";
import { VscGitPullRequestNewChanges } from "react-icons/vsc";
import { FaTicket, FaUsers } from "react-icons/fa6";
import "../styles/NavLinks.css"; // New custom CSS file

const NavLinks = ({ department, pathname, isDepartments }) => {
  const isDistrictManager = department === "District Manager";

  // Define navigation items with their properties
  const navItems = [
    ...(isDistrictManager
      ? [
          {
            to: "/dmcreateticket",
            label: "Create Ticket",
            icon: <FaTicket className="text-danger fs-5" />,
            activePaths: ["/dmcreateticket"],
          },
        ]
      : []),
    {
      to: isDistrictManager ? "/openedTickets" : isDepartments ? "/departmentopened" : "/",
      label: "Viewed",
      icon: <TbEyeCheck className="text-primary fs-5" />,
      activePaths: ["/openedTickets", "/departmentopened"],
    },
    ...(isDistrictManager
      ? [
          {
            to: "/inprogress",
            label: "Assigned",
            icon: <MdAssignmentTurnedIn className="text-warning fs-5" />,
            activePaths: ["/inprogress"],
          },
        ]
      : []),
    {
      to: isDistrictManager ? "/completed" : isDepartments ? "/departmentcompleted" : "/",
      label: "Completed",
      icon: <MdOutlineDoneAll className="text-success fs-5" />,
      activePaths: ["/completed", "/departmentcompleted"],
    },
    ...(isDistrictManager
      ? [
          {
            to: "/request-reopen",
            label: "Reopen Request",
            icon: <VscGitPullRequestNewChanges className="text-danger fs-5" />,
            activePaths: ["/request-reopen"],
          },
          {
            to: "/reopened",
            label: "Reopened",
            icon: <GoIssueReopened className="text-primary fs-5" />,
            activePaths: ["/reopened"],
          },
        ]
      : []),
    ...(isDepartments
      ? [
          {
            to: "/departmentsfromteam",
            label: "Team Tickets",
            icon: <FaUsers className="text-primary fs-5" />,
            activePaths: ["/departmentsfromteam"],
          },
        ]
      : []),
  ];

  return (
    <>
      {navItems.map((item, index) => (
        <Nav.Link
          key={index}
          as={Link}
          to={item.to}
          className={`nav-link-custom d-flex align-items-center gap-2 ${
            item.activePaths.includes(pathname) ? "active" : ""
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Nav.Link>
      ))}
    </>
  );
};

export default NavLinks;