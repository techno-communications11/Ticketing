import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/apiRequest";
import { useDispatch } from "react-redux";
import { setId, fetchIndividualTickets } from "../redux/marketSlice";
import PageCountStack from "../universalComponents/PageCountStack";
import "../styles/loader.css";
import TicketBody from "../universalComponents/TicketBody";
import FilterLogic from "../universalComponents/FilteringLogic";
import { useMyContext } from "../universalComponents/MyContext";
import StatusFilter from "../universalComponents/StatusFilter";
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from "../universalComponents/FullNameFilter";
import getDecodedToken from "../universalComponents/decodeToken";
import { FaExclamationCircle } from "react-icons/fa";
import "../styles/TotalUserTickets.css"; // Updated custom stylesheet

function TotalUserTickets() {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ntidFilter, setntidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const itemsPerPage = 30;
  const { adminntid, statusId, Dates } = useMyContext();
  const storedDates = JSON.parse(localStorage.getItem("dates")) || {};
  const { startDate, endDate } = Dates || storedDates;

  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);

  const handleFullnameFilterClick = () => {
    setFullnameToggle(!fullnameToggle);
    setStatusToggle(false);
    setNtidFilterToggle(false);
    setCreatedAtToggle(false);
    setCompletedAtToggle(false);
  };

  const handleStatusFilterClick = () => {
    setStatusToggle(!statusToggle);
    setNtidFilterToggle(false);
    setCreatedAtToggle(false);
    setCompletedAtToggle(false);
    setFullnameToggle(false);
  };

  const handleNTIDFilterClick = () => {
    setNtidFilterToggle(!ntidFilterToggle);
    setStatusToggle(false);
    setCreatedAtToggle(false);
    setCompletedAtToggle(false);
    setFullnameToggle(false);
  };

  const handleCreatedAtFilterClick = () => {
    setCreatedAtToggle(!createdAtToggle);
    setStatusToggle(false);
    setNtidFilterToggle(false);
    setCompletedAtToggle(false);
    setFullnameToggle(false);
  };

  const handleCompletedFilterClick = () => {
    setCompletedAtToggle(!completedAtToggle);
    setStatusToggle(false);
    setNtidFilterToggle(false);
    setCreatedAtToggle(false);
    setFullnameToggle(false);
  };

  const fetchUserTickets = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    let url = `/createTickets/usertickets`;

    try {
      const storedAdminntid = localStorage.getItem("adminntid");
      const storedStatusId = localStorage.getItem("statusId");

      if (adminntid || storedAdminntid) {
        params.append("ntid", adminntid || storedAdminntid);
      }
      if (!adminntid && (statusId || storedStatusId)) {
        params.append("statusId", statusId || storedStatusId);
      }
      if ((statusId || storedStatusId) && adminntid) {
        params.append("statusId", statusId || storedStatusId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiRequest.get(url);
      if (response.status === 200) {
        const data = response.data.data.filter((ticket) => {
          if (startDate && endDate) {
            const ticketDate = new Date(ticket.createdAt).toISOString().slice(0, 10);
            return ticketDate >= startDate && ticketDate <= endDate;
          }
          return true;
        });

        setTickets(data);
        setAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [statusId, adminntid, Dates]);

  const filteredTickets = FilterLogic(
    tickets || [],
    ntidFilter || "",
    createdAt || "",
    completedAt || "",
    statusFilter || "",
    fullnameFilter || ""
  );
  const department = getDecodedToken().department;

  const currentItems = filteredTickets
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  return (
    <div className="total-user-tickets-container">
      {loading ? (
        <div className="loader-overlay">
          <div className="loader" role="status" />
        </div>
      ) : (
        <>
          {currentItems.length > 0 && (
            <h4 className="tickets-title">Total User Tickets</h4>
          )}

          {authenticated && currentItems.length > 0 && (
            <div className="table-responsive">
              <table className="tickets-table table table-bordered table-hover">
                <thead className="sticky-top">
                  <tr>
                    {[
                      "SC.No",
                      "Email / NTID",
                      "Full Name",
                      "Status",
                      "CreatedAt",
                      ...(department === "SuperAdmin" ? ["Now At", "CompletedBy"] : []),
                      "CompletedAt",
                      "Duration",
                      "Details",
                      department === "SuperAdmin" && "Delete",
                    ]
                      .filter(Boolean)
                      .map((header) => (
                        <th key={header} className="text-center">
                          {header}
                          {header === "Status" && (
                            <>
                              <IoFilterSharp
                                className="filter-icon"
                                onClick={handleStatusFilterClick}
                                aria-label="Toggle Status Filter"
                              />
                              {statusToggle && (
                                <div className="filter-dropdown">
                                  <StatusFilter
                                    setStatusToggle={setStatusToggle}
                                    statusFilter={statusFilter}
                                    setStatusFilter={setStatusFilter}
                                    setCurrentPage={setCurrentPage}
                                  />
                                </div>
                              )}
                            </>
                          )}
                          {header === "Full Name" && (
                            <>
                              <IoFilterSharp
                                className="filter-icon"
                                onClick={handleFullnameFilterClick}
                                aria-label="Toggle Full Name Filter"
                              />
                              {fullnameToggle && (
                                <div className="filter-dropdown">
                                  <FullnameFilter
                                    setFullnameFilterToggle={setFullnameToggle}
                                    fullnameFilter={fullnameFilter}
                                    setFullnameFilter={setFullnameFilter}
                                    setCurrentPage={setCurrentPage}
                                  />
                                </div>
                              )}
                            </>
                          )}
                          {header === "Email / NTID" && (
                            <>
                              <IoFilterSharp
                                className="filter-icon"
                                onClick={handleNTIDFilterClick}
                                aria-label="Toggle NTID Filter"
                              />
                              {ntidFilterToggle && (
                                <div className="filter-dropdown">
                                  <NtidFilter
                                    setNtidFilterToggle={setNtidFilterToggle}
                                    ntidFilter={ntidFilter}
                                    setntidFilter={setntidFilter}
                                    setCurrentPage={setCurrentPage}
                                  />
                                </div>
                              )}
                            </>
                          )}
                          {header === "CreatedAt" && (
                            <>
                              <BsCalendar2DateFill
                                className="filter-icon"
                                onClick={handleCreatedAtFilterClick}
                                aria-label="Toggle Created At Filter"
                              />
                              {createdAtToggle && (
                                <div className="filter-dropdown">
                                  <CreatedAt
                                    setCreatedAtToggle={setCreatedAtToggle}
                                    createdAt={createdAt}
                                    setCreatedAt={setCreatedAt}
                                    setCurrentPage={setCurrentPage}
                                  />
                                </div>
                              )}
                            </>
                          )}
                          {header === "CompletedAt" && (
                            <>
                              <BsCalendar2DateFill
                                className="filter-icon"
                                onClick={handleCompletedFilterClick}
                                aria-label="Toggle Completed At Filter"
                              />
                              {completedAtToggle && (
                                <div className="filter-dropdown">
                                  <CompletedAt
                                    setCompletedAtToggle={setCompletedAtToggle}
                                    completedAt={completedAt}
                                    setCompletedAt={setCompletedAt}
                                    setCurrentPage={setCurrentPage}
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((ticket, index) => (
                    <TicketBody
                      fetchUserTickets={fetchUserTickets}
                      key={ticket.id}
                      ticket={ticket}
                      index={index}
                      handleTicket={handleTicket}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      tickets={tickets}
                      setTickets={setTickets}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {currentItems.length === 0 && (
            <div className="no-data-container">
              <FaExclamationCircle className="no-data-icon" />
              <p className="no-data-title">No Data Available</p>
              <p className="no-data-text">Please check back later or try refreshing the page.</p>
            </div>
          )}

          {currentItems.length > 0 && (
            <PageCountStack
              filteredTickets={filteredTickets}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default TotalUserTickets;