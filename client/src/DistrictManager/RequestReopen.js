import React, { useEffect, useState } from "react";
import { Table, Container } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import getDecodedToken from "../universalComponents/decodeToken";
import { apiRequest } from "../lib/apiRequest";
import { setId, fetchIndividualTickets } from "../redux/marketSlice";
import FilterLogic from "../universalComponents/FilteringLogic";
import TicketBody from "../universalComponents/TicketBody";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from "../universalComponents/FullNameFilter";
import StatusFilter from "../universalComponents/StatusFilter";
import PageCountStack from "../universalComponents/PageCountStack";
import "../styles/RequestReopen.css"; // New custom CSS file

function RequestReopen() {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [ntidFilter, setntidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);

  // Toggle Handlers
  const handleToggle = (toggleSetter, ...otherToggles) => {
    toggleSetter((prev) => !prev);
    otherToggles.forEach((toggle) => toggle(false));
  };

  // Fetch tickets
  useEffect(() => {
    const ntid = getDecodedToken()?.ntid;
    const fetchTickets = async () => {
      try {
        const response = await apiRequest.get("/createTickets/get_request_reopen_tickets", {
          params: { ntid },
        });
        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    if (ntid) {
      fetchTickets();
    }
  }, []);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const filteredTickets = FilterLogic(
    tickets,
    ntidFilter,
    createdAt,
    completedAt,
    statusFilter,
    fullnameFilter
  );

  const currentItems = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container fluid className="request-reopen-container">
      {currentItems.length > 0 && (
        <h3 className="text-center my-4 text-pink fw-bold">Reopen Requested Tickets</h3>
      )}
      <div className="table-wrapper">
        <Table className="table-custom">
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
                        onClick={() =>
                          handleToggle(
                            setStatusToggle,
                            setNtidFilterToggle,
                            setCreatedAtToggle,
                            setCompletedAtToggle,
                            setFullnameToggle
                          )
                        }
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
                    </div>
                  )}
                  {header === "Email / NTID" && (
                    <div className="filter-icon">
                      <IoFilterSharp
                        onClick={() =>
                          handleToggle(
                            setNtidFilterToggle,
                            setStatusToggle,
                            setCreatedAtToggle,
                            setCompletedAtToggle,
                            setFullnameToggle
                          )
                        }
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
                    </div>
                  )}
                  {header === "Full Name" && (
                    <div className="filter-icon">
                      <IoFilterSharp
                        onClick={() =>
                          handleToggle(
                            setFullnameToggle,
                            setStatusToggle,
                            setNtidFilterToggle,
                            setCreatedAtToggle,
                            setCompletedAtToggle
                          )
                        }
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
                    </div>
                  )}
                  {header === "CreatedAt" && (
                    <div className="filter-icon">
                      <BsCalendar2DateFill
                        onClick={() =>
                          handleToggle(
                            setCreatedAtToggle,
                            setStatusToggle,
                            setNtidFilterToggle,
                            setCompletedAtToggle,
                            setFullnameToggle
                          )
                        }
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
                    </div>
                  )}
                  {header === "CompletedAt" && (
                    <div className="filter-icon">
                      <BsCalendar2DateFill
                        onClick={() =>
                          handleToggle(
                            setCompletedAtToggle,
                            setStatusToggle,
                            setNtidFilterToggle,
                            setCreatedAtToggle,
                            setFullnameToggle
                          )
                        }
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
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {currentItems.length > 0 ? (
              currentItems.map((ticket, index) => (
                <TicketBody
                  key={ticket.id || index}
                  currentPage={currentPage}
                  ticket={ticket}
                  index={index}
                  handleTicket={handleTicket}
                  itemsPerPage={itemsPerPage}
                />
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center no-data">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
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

export default RequestReopen;