import React, { useState } from "react";
import { GrLinkNext } from "react-icons/gr";
import { Link } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast,ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import getDecodedToken from "./decodeToken";
import { apiRequest } from "../lib/apiRequest";
import { getDuration } from "../universalComponents/getDuration";
import formatDate from "../universalComponents/FormatDate";

import "../styles/TicketTable.css";
import "../styles/loader.css";

function TicketBody({
  ticket,
  index,
  currentPage,
  itemsPerPage,
  handleTicket,
  fetchUserTickets,
}) {
  const [loading, setLoading] = useState(false);
  const department = getDecodedToken().department;
  const navigate=useNavigate();

  const handleDelete = async (ticketId) => {
    setLoading(true);
    try {
      const response= await apiRequest.get(`/createTickets/deleteticket/${ticketId}`);

      // Show toast with delay for navigation
      if(response.status===200){
        toast.success("deleted successfully")
        setTimeout(() => {
          navigate('/SuperAdminHome')// Refetch tickets after navigation
        }, 1500);
      }
       // 3000ms to align with the toast duration
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Failed to delete ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const badgeClasses = {
    opened: "bg-secondary",
    inprogress: "bg-warning",
    completed: "bg-success",
    reopened: "bg-primary",
    new: "bg-info",
  };

  const statusTexts = {
    opened: "Opened",
    inprogress: "In Progress",
    completed: "Completed",
    reopened: "Reopened",
    new: "New",
  };

  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

  return (
    <tr key={index}>
      {loading ? (
        <td colSpan="10" className="text-center">
          <div className="spinner-border" role="status" aria-hidden="true">
            <span className="visually-hidden">Loading...</span>
          </div>
        </td>
      ) : (
        <>
          <td className="text-center fw-medium">{rowNumber}</td>
          <td className="text-center fw-medium text-shrink">{ticket.ntid}</td>
          <td className="text-center fw-medium text-shrink">{ticket.fullname}</td>
          <td className="text-center fw-medium text-shrink">
            <span
              className={`badge rounded-pill ${
                badgeClasses[ticket.status?.name] || "bg-secondary"
              }`}
            >
              {statusTexts[ticket.status?.name] || "Unknown"}
            </span>
          </td>
          <td className="text-center fw-medium text-shrink">
            {formatDate(ticket.createdAt)}
          </td>
          {department === "SuperAdmin" && (
            <>
              <td className="text-center fw-medium text-shrink text-capitalize">
                {ticket.openedByFullName?.toLowerCase() || "-"}
              </td>
              <td className="text-center fw-medium text-shrink text-capitalize">
                {ticket.status?.name === "completed"
                  ? ticket.openedByFullName?.toLowerCase()
                  : "-"}
              </td>
            </>
          )}
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
              <GrLinkNext
                onClick={() => handleTicket(ticket.ticketId)}
                aria-label="View Details"
                style={{ cursor: "pointer" }}
              />
            </Link>
          </td>
          {department === "SuperAdmin" && (
            <td className="text-center fw-medium">
              <RiDeleteBin6Line
                className="delete-icon bg-danger text-white p-1 rounded-5"
                onClick={() => handleDelete(ticket.ticketId)}
                style={{ cursor: "pointer", width: "60px", height: "25px" }}
                aria-label="Delete Ticket"
                disabled={loading}
              />
            </td>
          )}
        </>
      )}
      <ToastContainer/>
    </tr>
  );
}

export default TicketBody;
