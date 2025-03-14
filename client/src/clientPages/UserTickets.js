import React, { useEffect, useState, useCallback } from "react";
import { GrLinkNext } from "react-icons/gr";
import { BsCalendar2DateFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Container, Table } from "react-bootstrap";
import PageCountStack from "../universalComponents/PageCountStack";
import formatDate from "../universalComponents/FormatDate";
import "../styles/loader.css";
import { fetchStatusTickets, setUserAndStatus } from "../redux/userStatusSlice";
import { setId, fetchIndividualTickets } from "../redux/marketSlice";
import { getDuration } from "../universalComponents/getDuration";
import "../styles/UserTickets.css"; // Updated custom stylesheet
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import getDecodedToken from "../universalComponents/decodeToken";
import { FaExclamationCircle } from "react-icons/fa";

const UserTickets = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const itemsPerPage = 30;
  const ntids = getDecodedToken()?.ntid;

  const selectedStatus = useSelector((state) => state.userTickets.selectedStatus);
  const { statustickets: userTickets, loading } = useSelector((state) => state.userTickets);
  const tickets = useSelector((state) => state.tickets.tickets);
  const ticketArray = Array.isArray(userTickets)
    ? userTickets
    : Array.isArray(tickets)
    ? tickets
    : [];

  useEffect(() => {
    const statusToFetch = selectedStatus || localStorage.getItem("statusData");
    if (statusToFetch) {
      try {
        localStorage.setItem("statusData", statusToFetch);
        dispatch(fetchStatusTickets({ statusId: statusToFetch, ntid: ntids }));
        dispatch(setUserAndStatus({ statusId: statusToFetch }));
      } catch (error) {
        console.error("Failed to fetch status tickets:", error);
      }
    }
  }, [dispatch, selectedStatus, ntids]);

  const handleTicket = useCallback(
    (id) => {
      localStorage.setItem("selectedId", id);
      dispatch(setId(id));
      dispatch(fetchIndividualTickets(id));
    },
    [dispatch]
  );

  const handleCreatedAtFilterClick = () => setCreatedAtToggle((prev) => !prev);
  const handleCompletedAtFilterClick = () => setCompletedAtToggle((prev) => !prev);

  const filteredTickets = createdAt
    ? ticketArray.filter(
        (ticket) => new Date(ticket.createdAt).toISOString().split("T")[0] === createdAt
      )
    : ticketArray;

  const currentItems = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nonCompletedTickets = currentItems.filter((ticket) => ticket.requestreopen);
  const completedTickets = currentItems.filter((ticket) => !ticket.requestreopen);
  const sortedCompletedTickets = completedTickets.sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
  );
  const finalTickets = [...nonCompletedTickets, ...sortedCompletedTickets];

  const getStatusColor = (ticket) => {
    if (ticket.requestreopen) return { color: "#006A4E" }; // Green for reopened
    if (ticket.isSettled) return { color: "#6B7280" }; // Gray for settled
    return {};
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "opened":
        return "bg-secondary";
      case "inprogress":
        return "bg-warning text-dark";
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
    <Container fluid className="user-tickets-container mt-1">
      {loading ? (
        <div className="loader-overlay">
          <div className="loader" role="status" />
        </div>
      ) : (
        <>
          {finalTickets.length > 0 && (
            <>
              <h3 className="tickets-title">
                {ticketArray[0]?.status.name?.charAt(0).toUpperCase() +
                  ticketArray[0]?.status.name?.slice(1) || ""}{" "}
                Tickets
              </h3>
              <div className="table-responsive">
                <Table bordered hover className="tickets-table">
                  <thead>
                    <tr>
                      {[
                        "SC.No",
                        "Email / NTID",
                        "Full Name",
                        "Status",
                        "CreatedAt",
                        "CompletedAt",
                        "Duration",
                        "Details",
                      ].map((header) => (
                        <th key={header} className="text-center">
                          {header}
                          {header === "CreatedAt" && (
                            <BsCalendar2DateFill
                              className="filter-icon"
                              onClick={handleCreatedAtFilterClick}
                              aria-label="Toggle Created At Filter"
                            />
                          )}
                          {header === "CompletedAt" && (
                            <BsCalendar2DateFill
                              className="filter-icon"
                              onClick={handleCompletedAtFilterClick}
                              aria-label="Toggle Completed At Filter"
                            />
                          )}
                          {(header === "CreatedAt" && createdAtToggle) && (
                            <div className="filter-dropdown">
                              <CreatedAt
                                createdAt={createdAt}
                                setCreatedAt={setCreatedAt}
                                setCurrentPage={setCurrentPage}
                                setCreatedAtToggle={setCreatedAtToggle}
                              />
                            </div>
                          )}
                          {(header === "CompletedAt" && completedAtToggle) && (
                            <div className="filter-dropdown">
                              <CompletedAt
                                completedAt={completedAt}
                                setCompletedAt={setCompletedAt}
                                setCurrentPage={setCurrentPage}
                                setCompletedAtToggle={setCompletedAtToggle}
                              />
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {finalTickets.map((ticket, index) => (
                      <tr
                        key={ticket.ticketId}
                        className={ticket.isSettled ? "settled-row" : ""}
                      >
                        <td className="text-center" style={getStatusColor(ticket)}>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="text-center" style={getStatusColor(ticket)}>
                          {ticket.ntid}
                        </td>
                        <td className="text-center" style={getStatusColor(ticket)}>
                          {ticket.fullname}
                        </td>
                        <td className="text-center" style={getStatusColor(ticket)}>
                          <span className={`badge ${getBadgeClass(ticket.status?.name)}`}>
                            {ticket.isSettled ? "Settled" : getStatusText(ticket.status?.name)}
                          </span>
                        </td>
                        <td className="text-center" style={getStatusColor(ticket)}>
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="text-center" style={getStatusColor(ticket)}>
                          {ticket.completedAt ? formatDate(ticket.completedAt) : "-"}
                        </td>
                        <td className="text-center" style={getStatusColor(ticket)}>
                          {ticket.completedAt ? getDuration(ticket.createdAt, ticket.completedAt) : "-"}
                        </td>
                        <td className="text-center">
                          <Link to="/details" aria-label="View Ticket Details">
                            <GrLinkNext
                              className="details-icon"
                              onClick={() => handleTicket(ticket.ticketId)}
                            />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}

          {finalTickets.length === 0 && (
            <div className="no-data-container">
              <FaExclamationCircle className="no-data-icon me-1" />
              <p className="no-data-title">No Data Available</p>
            </div>
          )}

          {finalTickets.length > 0 && (
            <PageCountStack
              filteredTickets={filteredTickets}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default UserTickets;