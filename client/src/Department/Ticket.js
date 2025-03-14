import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/apiRequest";
import TicketBody from "../universalComponents/TicketBody";
import PageCountStack from "../universalComponents/PageCountStack";
import { Container } from "react-bootstrap";
import getDecodedToken from "../universalComponents/decodeToken";
import FilterLogic from "../universalComponents/FilteringLogic";
import { useDispatch } from "react-redux";
import { setId, fetchIndividualTickets } from "../redux/marketSlice";
import { useMyContext } from "../universalComponents/MyContext";
import StatusFilter from "../universalComponents/StatusFilter";
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from "../universalComponents/FullNameFilter";
import { FaExclamationCircle } from "react-icons/fa";
import "../styles/TicketTable.css"; // Updated custom CSS

function Ticket({ status, openedBy, fullname }) {
  const [tickets, setTickets] = useState([]);
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ntidFilter, setNtidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const itemsPerPage = 30;
  const { statusId } = useMyContext();

  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);

  useEffect(() => {
    const ntid = getDecodedToken()?.ntid;

    const fetchUserTickets = async () => {
      try {
        const response = await apiRequest.get("/createTickets/getdepartmenttickets", {
          params: { ntid, statusId },
        });

        let fetchedTickets = response.data;

        if (openedBy === null && status === "3" && fullname === null) {
          fetchedTickets = fetchedTickets.filter(
            (ticket) =>
              ticket.openedBy === null &&
              (ticket.status.id === "3" || ticket.status.id === "1" || ticket.status.id === "5") &&
              ticket.assignToTeam === null
          );
        } else if (openedBy && status === "3" && fullname === null) {
          fetchedTickets = fetchedTickets.filter(
            (ticket) => ticket.status.id !== "4" && ticket.openedBy === openedBy
          );
        } else if (status === "4") {
          fetchedTickets = fetchedTickets.filter(
            (ticket) => ticket.status.id === "4" && ticket.openedBy === openedBy
          );
        } else if (fullname) {
          fetchedTickets = fetchedTickets.filter(
            (ticket) =>
              ticket.assignToTeam === fullname && ticket.status.id !== "4" && ticket.openedBy === null
          );
        }

        setTickets(fetchedTickets);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      }
    };

    if (ntid) {
      fetchUserTickets();
    }
  }, [statusId, openedBy, fullname]);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const filteredTickets = FilterLogic(
    tickets || [],
    ntidFilter || "",
    createdAt || "",
    completedAt || "",
    statusFilter || "",
    fullnameFilter || ""
  );

  const currentItems = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container fluid className="ticket-container">
      {currentItems.length > 0 ? (
        <div className="table-wrapper">
          <h3 className="text-center my-4 text-pink fw-bold">Tickets</h3>
          <div className="table-responsive">
            <table className="table table-custom">
              <thead className="table-header">
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
                      {header === "Status" && (
                        <div className="filter-icon">
                          <IoFilterSharp
                            onClick={() => setStatusToggle(!statusToggle)}
                          />
                          {statusToggle && (
                            <div className="filter-dropdown">
                              <StatusFilter
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                setCurrentPage={setCurrentPage}
                                setStatusToggle={setStatusToggle}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {header === "Email / NTID" && (
                        <div className="filter-icon">
                          <IoFilterSharp
                            onClick={() => setNtidFilterToggle(!ntidFilterToggle)}
                          />
                          {ntidFilterToggle && (
                            <div className="filter-dropdown">
                              <NtidFilter
                                ntidFilter={ntidFilter}
                                setntidFilter={setNtidFilter}
                                setCurrentPage={setCurrentPage}
                                setNtidFilterToggle={setNtidFilterToggle}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {header === "Full Name" && (
                        <div className="filter-icon">
                          <IoFilterSharp
                            onClick={() => setFullnameToggle(!fullnameToggle)}
                          />
                          {fullnameToggle && (
                            <div className="filter-dropdown">
                              <FullnameFilter
                                fullnameFilter={fullnameFilter}
                                setFullnameFilter={setFullnameFilter}
                                setCurrentPage={setCurrentPage}
                                setFullnameFilterToggle={setFullnameFilter}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {header === "CreatedAt" && (
                        <div className="filter-icon">
                          <BsCalendar2DateFill
                            onClick={() => setCreatedAtToggle(!createdAtToggle)}
                          />
                          {createdAtToggle && (
                            <div className="filter-dropdown">
                              <CreatedAt
                                createdAt={createdAt}
                                setCreatedAt={setCreatedAt}
                                setCurrentPage={setCurrentPage}
                                setCreatedAtToggle={setCreatedAtToggle}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {header === "CompletedAt" && (
                        <div className="filter-icon">
                          <BsCalendar2DateFill
                            onClick={() => setCompletedAtToggle(!completedAtToggle)}
                          />
                          {completedAtToggle && (
                            <div className="filter-dropdown">
                              <CompletedAt
                                completedAt={completedAt}
                                setCompletedAt={setCompletedAt}
                                setCurrentPage={setCurrentPage}
                                setCompletedAtToggle={setCompletedAtToggle}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="table-body">
                {currentItems.map((ticket, index) => (
                  <TicketBody
                    key={ticket.id}
                    ticket={ticket}
                    index={index}
                    handleTicket={handleTicket}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="no-data-container">
          <FaExclamationCircle className="text-pink" />
          <p className="fs-2 fw-bold text-muted">No data available...</p>
          <p className="text-muted">Please check back later or try refreshing the page.</p>
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
    </Container>
  );
}

export default Ticket;