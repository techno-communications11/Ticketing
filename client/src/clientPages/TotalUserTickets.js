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
import { FaExclamationCircle } from 'react-icons/fa';
import '../styles/TicketTable.css';

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
  const storedDates = JSON.parse(localStorage.getItem('dates')) || {};
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
  };

  const handleNTIDFilterClick = () => {
    setNtidFilterToggle(!ntidFilterToggle);
    setStatusToggle(false);
    setCreatedAtToggle(false);
    setCompletedAtToggle(false);
  };

  const handleCreatedAtFilterClick = () => {
    setCreatedAtToggle(!createdAtToggle);
    setStatusToggle(false);
    setNtidFilterToggle(false);
    setCompletedAtToggle(false);
  };

  const handleCompletedFilterClick = () => {
    setCompletedAtToggle(!completedAtToggle);
    setStatusToggle(false);
    setNtidFilterToggle(false);
    setCreatedAtToggle(false);
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

  if (loading) return <div className="loader"></div>;

  return (
    <div className="container-fluid mt-1">
      {currentItems.length > 0 && (
        <h4
          className="my-2 d-flex justify-content-center"
          style={{ color: "#E10174", fontSize: "1.5rem" }}
        >
          Total User Tickets
        </h4>
      )}

      {authenticated && (
        <div className="table-responsive table-container3" style={{ zIndex: 1 }}>
          <table className="table table-bordered table-hover table-sm" style={{ fontSize: '0.95rem' }}>
            <thead className="sticky-top" style={{ top: 0, zIndex: 1 }}>
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
                ].map((header) => (
                  <th
                    key={header}
                    className="text-center"
                    style={{ backgroundColor: "#E10174", color: "white" }}
                  >
                    {header}
                    {header === "Status" && (
                      <>
                        <IoFilterSharp
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleStatusFilterClick}
                        />
                        {statusToggle && (
                          <div className="dropdown-menu show">
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
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleFullnameFilterClick}
                        />
                        {fullnameToggle && (
                          <div className="dropdown-menu show">
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
                    {header === "NTID" && (
                      <>
                        <IoFilterSharp
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleNTIDFilterClick}
                        />
                        {ntidFilterToggle && (
                          <div className="dropdown-menu show">
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
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleCreatedAtFilterClick}
                        />
                        {createdAtToggle && (
                          <div className="dropdown-menu show">
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
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleCompletedFilterClick}
                        />
                        {completedAtToggle && (
                          <div className="dropdown-menu show">
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
              {currentItems.length > 0 ? (
                currentItems.map((ticket, index) => (
                  <TicketBody
                    fetchUserTickets={fetchUserTickets}
                    key={ticket.id}
                    ticket={ticket}
                    index={index}
                    handleTicket={handleTicket}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    tickets={tickets} // Added tickets prop
                    setTickets={setTickets}
                  />
                ))
              ) : (
                <tr></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {currentItems.length > 0 ? (
        <PageCountStack
          filteredTickets={filteredTickets}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      ) : (
        <div className='d-flex flex-column align-items-center justify-content-center' style={{ height: '80vh' }}>
          <FaExclamationCircle className='text-secondary' style={{ fontSize: '5rem', marginBottom: '1rem' }} />
          <p className='fs-1 fw-bolder text-muted'>No data available ...</p>
          <p className='text-muted'>Please check back later or try refreshing the page.</p>
        </div>
      )}
    </div>
  );
}

export default TotalUserTickets;