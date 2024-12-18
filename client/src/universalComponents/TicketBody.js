import React, { useState } from "react";
import { GrLinkNext } from "react-icons/gr";
import { Link } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ToastContainer, toast } from "react-toastify";

import getDecodedToken from "./decodeToken";
import { apiRequest } from "../lib/apiRequest";
import { getDuration } from "../universalComponents/getDuration";
import formatDate from "../universalComponents/FormatDate";

import "../styles/TicketTable.css";
import "../styles/loader.css";
import "react-toastify/dist/ReactToastify.css";

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

  const handleDelete = async (ticketId) => {
    setLoading(true);
    try {
      await apiRequest.get(`/createTickets/deleteticket/${ticketId}`);
      toast.success("Ticket deleted successfully!");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Failed to delete ticket. Please try again.");
    } finally {
      setLoading(false);
      fetchUserTickets();
    }
  };

  const getBadgeClass = (status) => {
    const badgeClasses = {
      opened: "bg-secondary",
      inprogress: "bg-warning",
      completed: "bg-success",
      reopened: "bg-primary",
      new: "bg-info",
    };
    return badgeClasses[status] || "bg-secondary";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      opened: "Opened",
      inprogress: "In Progress",
      completed: "Completed",
      reopened: "Reopened",
      new: "New",
    };
    return statusTexts[status] || "Unknown";
  };

  return (
    <>
      {loading ? (
        <tr>
          <td colSpan="10" className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
      ) : (
        <tr key={index}>
          <td className="text-center fw-medium">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </td>
          <td className="text-center fw-medium text-shrink">{ticket.ntid}</td>
          <td className="text-center fw-medium text-shrink">{ticket.fullname}</td>
          <td className="text-center fw-medium text-shrink">
            <span
              className={`badge rounded-pill ${getBadgeClass(
                ticket.status?.name
              )}`}
            >
              {getStatusText(ticket.status?.name)}
            </span>
          </td>
          <td className="text-center fw-medium text-shrink">
            {formatDate(ticket.createdAt)}
          </td>
          {department === "SuperAdmin" && (
            <>
              <td className="text-center fw-medium text-shrink">
                {ticket.openedByFullName || "-"}
              </td>
              <td className="text-center fw-medium text-shrink">
                {ticket.status?.name === "completed"
                  ? ticket.openedByFullName
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
              <GrLinkNext onClick={() => handleTicket(ticket.ticketId)} />
            </Link>
          </td>
          {department === "SuperAdmin" && (
            <td className="text-center fw-medium">
              <RiDeleteBin6Line
                className="delete-icon bg-danger text-white p-1 rounded-5"
                disabled={loading}
                onClick={() => handleDelete(ticket.ticketId)}
                style={{ cursor: "pointer", width: "60px", height: "25px" }}
              />
            </td>
          )}
        </tr>
      )}
      <ToastContainer />
    </>
  );
}

export default TicketBody;
