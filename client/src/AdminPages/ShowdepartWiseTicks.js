import React, { useEffect, useState, useMemo } from "react";
import { Container, Table } from "react-bootstrap";
import "../styles/loader.css";
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


const ShowdepartWiseTicks = () => {
  const dispatch = useDispatch();
  const { department, statusId } = useMyContext();
  const [tickets, setTickets] = useState([]);
  const [market, setMarket] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [ntidFilter, setntidFilter] = useState("");
  const itemsPerPage = 30;
  console.log(typeof(statusId));
  // Filter toggle states
  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await apiRequest.get("/createTickets/DepartmentWiseTickets", {
        params: { department, statusId },
      });
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  };

  useEffect(() => {
    if (department && statusId) {
      fetchTickets();
    }
  }, [department, statusId]);

  // Set market name if tickets are available
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
  // Filtered and paginated tickets
  const filteredTickets = FilterLogic(
    tickets,
    ntidFilter,
    createdAt,
    completedAt,
    statusFilter,
    fullnameFilter
  );

  const currentItems = useMemo(() => {
    const sortedTickets = [...filteredTickets].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sortedTickets.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredTickets, currentPage, itemsPerPage]);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  return (
    <Container className="mt-2">
      <div className="col-12 d-flex flex-column flex-md-row align-items-center mb-2">
        <h3
          className="col-12 col-md-5 mb-0 font-family text-capitalize"
          style={{ color: "#E10174" }}
        >
          Tickets from Market {market?.toLowerCase()}
        </h3>
      </div>

      {tickets.length === 0 ? (
        <div className="vh-100 d-flex align-items-center justify-content-center">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                {["SC.No", "NTID", "Full Name", "Status", "CreatedAt", "CompletedAt", "Duration", "Details"].map(
                  (header) => (
                    <th key={header} className="text-center" style={{ backgroundColor: "#E10174", color: "white" }}>
                      {header}
                      {header === "Status" && (
                        <>
                          <IoFilterSharp
                            style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                            onClick={() => (!handleStatusFilterClick)}
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
                              setFullnameToggle={setFullnameToggle}
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
                  )
                )}
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
                  <td colSpan="8" className="text-center">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <PageCountStack
            filteredTickets={filteredTickets}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}
    </Container>
  );
};

export default ShowdepartWiseTicks;