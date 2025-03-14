import React, { useEffect, useState } from "react";
import { Container, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import PageCountStack from "../universalComponents/PageCountStack";
import { fetchStatusWiseTickets, setMarketAndStatus } from "../redux/statusSlice";
import { jwtDecode } from "jwt-decode";
import { setId, fetchIndividualTickets } from "../redux/marketSlice";
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from "../universalComponents/FullNameFilter";
import StatusFilter from "../universalComponents/StatusFilter";
import FilterLogic from "../universalComponents/FilteringLogic";
import TicketBody from "../universalComponents/TicketBody";
import "../styles/TicketsTable.css"; // Updated custom CSS

const TicketsTable = ({ statusIds, text, logedInuser }) => {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Filters and Toggles
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [ntidFilter, setNtidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");

  // Toggle States for Filters
  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);

  const token = localStorage.getItem("token");
  const userId = token ? jwtDecode(token) : {};

  // Toggle Handlers
  const handleToggle = (toggleSetter, ...otherToggles) => {
    toggleSetter((prev) => !prev);
    otherToggles.forEach((toggle) => toggle(false));
  };

  // Filtered Tickets
  const filteredTickets = FilterLogic(
    tickets,
    ntidFilter,
    createdAt,
    completedAt,
    statusFilter,
    fullnameFilter
  );

  // Fetch Tickets on Initial Load
  useEffect(() => {
    const storedMarket = userId?.id;
    const hasFetched = localStorage.getItem("hasFetched");

    if (storedMarket && !hasFetched) {
      const fetchTickets = async () => {
        const allTickets = await Promise.all(
          statusIds.map((statusId) =>
            dispatch(fetchStatusWiseTickets({ id: storedMarket, statusId }))
          )
        );

        const combined = allTickets.flatMap((ticket) => ticket.payload || []);

        let filteredTickets = combined;

        if (logedInuser) {
          filteredTickets = filteredTickets.filter(
            (ticket) => ticket.openedBy === logedInuser
          );
        }

        setTickets(filteredTickets);
      };

      fetchTickets();
      statusIds.forEach((statusId) =>
        dispatch(setMarketAndStatus({ id: storedMarket, statusId }))
      );
      localStorage.setItem("hasFetched", true);
    }
  }, [statusIds, userId, logedInuser, dispatch]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("hasFetched");
    };
  }, []);

  // Handle Ticket Selection
  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const currentItems = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const completedTickets = currentItems.filter((ticket) => ticket.isSettled);
  const nonCompletedTickets = currentItems.filter((ticket) => !ticket.isSettled);
  const sortedCompletedTickets = completedTickets.sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
  );
  const finalTickets = [...nonCompletedTickets, ...sortedCompletedTickets];

  return (
    <Container fluid className="tickets-table-container">
      {finalTickets.length > 0 && (
        <h3 className="text-center my-4 text-pink fw-bold">{text} Tickets</h3>
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
                            setFullnameFilterToggle={setFullnameToggle}
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
            {finalTickets.length > 0 ? (
              finalTickets.map((ticket, index) => (
                <TicketBody
                  key={ticket.id || index}
                  ticket={ticket}
                  index={index}
                  handleTicket={handleTicket}
                  currentPage={currentPage}
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

      {finalTickets.length > 0 && (
        <PageCountStack
          filteredTickets={filteredTickets}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </Container>
  );
};

export default TicketsTable;