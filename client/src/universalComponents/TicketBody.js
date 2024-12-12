import React from "react";
import { GrLinkNext } from "react-icons/gr";
import { Link } from "react-router-dom";
import { getDuration } from "../universalComponents/getDuration";
import formatDate from "../universalComponents/FormatDate";
import "../styles/TicketTable.css";
import { RiDeleteBin6Line } from "react-icons/ri";
import getDecodedToken from "./decodeToken";
import { apiRequest } from "../lib/apiRequest";
import "../styles/loader.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

function TicketBody({
  ticket,
  index,
  currentPage,
  itemsPerPage,
  handleTicket,
  fetchUserTickets
}) {
  const department = getDecodedToken().department;
  const [loading, setLoading] = useState(false);
  const handleDelete = async (ticketId) => {
    console.log(ticketId, "ttttttt");
    setLoading(true);
    try {
      // Use the correct URL pattern for the DELETE request
      const response = await apiRequest.get(
        `/createTickets/deleteticket/${ticketId}`,
        {}
      );

      if (response.status===200) {
        toast.success("ticket deleted")
        setTimeout(()=>{
          fetchUserTickets();
        },[1500])
      }
      
    } catch (error) {
      console.error("Error deleting ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "opened":
        return "bg-secondary";
      case "inprogress":
        return "bg-warning";
      case "completed":
        return "bg-success";
      case "reopened":
        return "bg-primary";
      case "new":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "opened":
        return "Opened";
      case "inprogress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "reopened":
        return "Reopened";
      case "new":
        return "New";
      default:
        return "Unknown";
    }
  };

  return (
    <tr key={ticket.ticketId}>
      <td className="text-center fw-medium">
        {(currentPage - 1) * itemsPerPage + index + 1}
      </td>
      <td className="text-center fw-medium text-shrink">{ticket.ntid}</td>
      <td className="text-center fw-medium text-shrink">{ticket.fullname}</td>
      <td className="text-center fw-medium text-shrink">
        <span
          className={`badge rounded-pill ${getBadgeClass(ticket.status?.name)}`}
        >
          {getStatusText(ticket.status?.name)}
        </span>
      </td>
      <td className="text-center fw-medium text-shrink">
        {formatDate(ticket.createdAt)}
      </td>
      {department === "SuperAdmin" && ( <td className="text-center fw-medium text-shrink">
        {ticket.openedByFullName|| "-"}
      </td>)}
      {department === "SuperAdmin" && ( <td className="text-center fw-medium text-shrink">
        { ticket.status?.name==='completed'?ticket.openedByFullName: "-"}
      </td>)}
      <td className="text-center fw-medium text-shrink">
        {ticket.completedAt ? formatDate(ticket.completedAt) : "-"}
      </td>
      <td className="text-center fw-medium text-shrink">
        {ticket.completedAt
          ? getDuration(ticket.createdAt, ticket.completedAt)
          : "-"}
      </td>
      <td className="text-center fw-medium">
        <Link to="/details">
          <GrLinkNext onClick={() => handleTicket(ticket.ticketId)} />
        </Link>
      </td>
      {department === "SuperAdmin" && (
        <td className="text-center fw-medium">
          {loading ? (
            <div class="spinner-border text-primary"></div>
          ) : (
            <RiDeleteBin6Line
              className=" bg-danger text-white p-1 rounded-5"
              disabled={loading}
              style={{ cursor: "pointer", width: "60px", height: "25px" }}
              onClick={() => handleDelete(ticket.ticketId)}
            />
          )}
        </td>
      )}
      <ToastContainer />
    </tr>
    
  );
}

export default TicketBody;
