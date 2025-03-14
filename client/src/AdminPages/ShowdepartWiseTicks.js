import React, { useEffect, useState, useMemo } from "react";
import { Container, Table, Row, Col, Dropdown } from "react-bootstrap";
import PageCountStack from "../universalComponents/PageCountStack";
import FilterLogic from "../universalComponents/FilteringLogic";
import TicketBody from "../universalComponents/TicketBody";
import { BsCalendar2DateFill } from "react-icons/bs";
import { IoFilterSharp } from "react-icons/io5";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from "../universalComponents/FullNameFilter";
import StatusFilter from "../universalComponents/StatusFilter";
import { useMyContext } from "../universalComponents/MyContext";
import { apiRequest } from "../lib/apiRequest";
import { useDispatch } from "react-redux";
import { setId, fetchIndividualTickets } from "../redux/marketSlice";
import getDecodedToken from "../universalComponents/decodeToken";
import { FaExclamationCircle } from "react-icons/fa";
import "../styles/ShowdepartWiseTicks.css"; // New CSS file for this component

const ShowdepartWiseTicks = () => {
  const dispatch = useDispatch();
  const { department, statusId, Dates } = useMyContext();
  const [tickets, setTickets] = useState([]);
  const [market, setMarket] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [ntidFilter, setntidFilter] = useState("");
  const itemsPerPage = 30;

  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);
  const userData = getDecodedToken();
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get("/createTickets/DepartmentWiseTickets", {
        params: { department, statusId },
      });
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (department && statusId) {
      fetchTickets();
    }
  }, [department, statusId]);

  useEffect(() => {
    if (tickets.length > 0) {
      setMarket(tickets[0]?.market?.toUpperCase() || "");
    }
  }, [tickets]);

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

  const filteredTickets = FilterLogic(
    tickets.filter((item) => {
      const { startDate, endDate } = Dates;
      if (startDate && endDate) {
        const ticketDate = new Date(item.createdAt).toISOString().slice(0, 10);
        return ticketDate >= startDate && ticketDate <= endDate;
      }
      return true;
    }),
    ntidFilter,
    createdAt,
    completedAt,
    statusFilter,
    fullnameFilter
  );

  const currentItems = useMemo(() => {
    let sortedTickets = [...filteredTickets].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (userData.department !== "SuperAdmin") {
      sortedTickets = sortedTickets.filter((ticket) => ticket.openedBy === userData.id);
    }

    return sortedTickets.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredTickets, currentPage, itemsPerPage, userData]);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  return (
    <Container fluid className="mt-4">
      {/* Header Section */}
      <Row className="mb-3 align-items-center">
        <Col xs={12}>
          <h3 className="fw-bold text-dark">
            Tickets from Market: <span style={{ color: "#E10174" }}>{market || "N/A"}</span>
          </h3>
        </Col>
      </Row>

      {/* Loading State */}
      {loading ? (
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="spinner-border text-pink" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <Table hover className="table-modern">
            <thead>
              <tr style={{ backgroundColor: "#E10174", color: "white" }}>
                {[
                  "SC.No",
                  "Email / NTID",
                  "Full Name",
                  "Status",
                  "CreatedAt",
                  ...(userData.department === "SuperAdmin" ? ["Now At", "CompletedBy"] : []),
                  "CompletedAt",
                  "Duration",
                  "Details",
                  ...(userData.department === "SuperAdmin" ? ["Delete"] : []),
                ].map((header) => (
                  <th key={header} className="text-center align-middle fw-medium">
                    {header}
                    {header === "Status" && (
                      <Dropdown as="span" className="ms-2">
                        <IoFilterSharp
                          style={{ cursor: "pointer", color: "white" }}
                          onClick={handleStatusFilterClick}
                        />
                        {statusToggle && (
                          <div className="dropdown-menu show p-3 shadow-sm">
                            <StatusFilter
                              setStatusToggle={setStatusToggle}
                              statusFilter={statusFilter}
                              setStatusFilter={setStatusFilter}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </Dropdown>
                    )}
                    {header === "Full Name" && (
                      <Dropdown as="span" className="ms-2">
                        <IoFilterSharp
                          style={{ cursor: "pointer", color: "white" }}
                          onClick={handleFullnameFilterClick}
                        />
                        {fullnameToggle && (
                          <div className="dropdown-menu show p-3 shadow-sm">
                            <FullnameFilter
                              setFullnameFilterToggle={setFullnameToggle}
                              fullnameFilter={fullnameFilter}
                              setFullnameFilter={setFullnameFilter}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </Dropdown>
                    )}
                    {header === "Email / NTID" && (
                      <Dropdown as="span" className="ms-2">
                        <IoFilterSharp
                          style={{ cursor: "pointer", color: "white" }}
                          onClick={handleNTIDFilterClick}
                        />
                        {ntidFilterToggle && (
                          <div className="dropdown-menu show p-3 shadow-sm">
                            <NtidFilter
                              setNtidFilterToggle={setNtidFilterToggle}
                              ntidFilter={ntidFilter}
                              setntidFilter={setntidFilter}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </Dropdown>
                    )}
                    {header === "CreatedAt" && (
                      <Dropdown as="span" className="ms-2">
                        <BsCalendar2DateFill
                          style={{ cursor: "pointer", color: "white" }}
                          onClick={handleCreatedAtFilterClick}
                        />
                        {createdAtToggle && (
                          <div className="dropdown-menu show p-3 shadow-sm">
                            <CreatedAt
                              setCreatedAtToggle={setCreatedAtToggle}
                              createdAt={createdAt}
                              setCreatedAt={setCreatedAt}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </Dropdown>
                    )}
                    {header === "CompletedAt" && (
                      <Dropdown as="span" className="ms-2">
                        <BsCalendar2DateFill
                          style={{ cursor: "pointer", color: "white" }}
                          onClick={handleCompletedFilterClick}
                        />
                        {completedAtToggle && (
                          <div className="dropdown-menu show p-3 shadow-sm">
                            <CompletedAt
                              setCompletedAtToggle={setCompletedAtToggle}
                              completedAt={completedAt}
                              setCompletedAt={setCompletedAt}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </Dropdown>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((ticket, index) => (
                  <TicketBody
                    key={ticket.id}
                    ticket={ticket}
                    index={index}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    handleTicket={handleTicket}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={userData.department === "SuperAdmin" ? 11 : 8} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center">
                      <FaExclamationCircle className="text-muted mb-3" style={{ fontSize: "4rem" }} />
                      <h5 className="fw-bold text-muted">No Data Available</h5>
                      <p className="text-muted">Check back later or try refreshing the page.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {currentItems.length > 0 && (
        <div className="mt-4">
          <PageCountStack
            filteredTickets={filteredTickets}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </Container>
  );
};

export default ShowdepartWiseTicks;