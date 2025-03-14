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
import "../styles/GetAllDeptTickets.css"; // New custom CSS file

function GetAllDeptTickets() {
  const [tickets, setTickets] = useState([]);
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ntidFilter, setntidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const itemsPerPage = 30;
  const { statusId } = useMyContext();

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

  useEffect(() => {
    const ntid = getDecodedToken()?.ntid;

    const fetchUserTickets = async () => {
      try {
        const response = await apiRequest.get("/createTickets/getdepartmenttickets", {
          params: { ntid, statusId },
        });
        setTickets(response.data);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      }
    };

    if (ntid) {
      fetchUserTickets();
    }
  }, [statusId]);

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
    <Container fluid className="dept-tickets-container">
      <h3 className="text-center my-4 text-pink fw-bold">Department Tickets</h3>

      <div className="table-wrapper">
        {currentItems.length > 0 ? (
          <table className="table table-custom">
            <thead className="table-header">
              <tr>
                {[
                  "SC.No",
                  "NTID",
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
                              statusFilter={statusFilter}
                              setStatusFilter={setStatusFilter}
                              setCurrentPage={setCurrentPage}
                              setStatusToggle={setStatusToggle}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {header === "NTID" && (
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
                              ntidFilter={ntidFilter}
                              setntidFilter={setntidFilter}
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
                              fullnameFilter={fullnameFilter}
                              setFullnameFilter={setFullnameFilter}
                              setCurrentPage={setCurrentPage}
                              setFullnameFilterToggle={setFullnameToggle} // Fixed typo
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
                              createdAt={createdAt}
                              setCreatedAt={setCreatedAt}
                              setCurrentPage={setCurrentPage}
                              setCreatedAtToggle={setCreatedAtToggle} // Fixed typo
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
                  key={ticket.id || index}
                  ticket={ticket}
                  index={index}
                  handleTicket={handleTicket}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data-container">
            <p className="no-data">No tickets found.</p>
          </div>
        )}
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

export default GetAllDeptTickets;