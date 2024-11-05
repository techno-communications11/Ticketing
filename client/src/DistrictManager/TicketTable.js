import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import PageCountStack from '../universalComponents/PageCountStack';
import { fetchStatusWiseTickets, setMarketAndStatus } from '../redux/statusSlice';
import { jwtDecode } from 'jwt-decode';
import '../styles/TicketTable.css';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from '../universalComponents/FullNameFilter';
import StatusFilter from '../universalComponents/StatusFilter';
import FilterLogic from '../universalComponents/FilteringLogic';
import TicketBody from '../universalComponents/TicketBody';
import { Table } from 'react-bootstrap';

const TicketsTable = ({ statusIds, text }) => {
  const dispatch = useDispatch();
  const [market, setMarket] = useState('');
  const [tickets, setTickets] = useState([]);
  const token = localStorage.getItem("token");
  const userId = jwtDecode(token);
  const [activeFilter, setActiveFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ntidFilter, setntidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState('');
  const itemsPerPage = 8;

  const filteredTickets = FilterLogic(
    tickets || [],
    ntidFilter || "",
    createdAt || "",
    completedAt || "",
    statusFilter || "",
    fullnameFilter || ""
  );

  useEffect(() => {
    const storedMarket = userId?.id;
    const hasFetched = localStorage.getItem("hasFetched");

    if (storedMarket && !hasFetched) {
      const fetchTickets = async () => {
        const allTickets = await Promise.all(
          statusIds.map(statusId => dispatch(fetchStatusWiseTickets({ id: storedMarket, statusId })))
        );
        const combined = allTickets.flatMap(ticket => ticket.payload || []);
        setTickets(combined);
      };

      fetchTickets();
      statusIds.forEach(statusId => dispatch(setMarketAndStatus({ id: storedMarket, statusId })));
      localStorage.setItem("hasFetched", true);
    }
  }, [dispatch, userId, statusIds]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("hasFetched");
    };
  }, []);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  useEffect(() => {
    if (tickets.length > 0 && tickets[0]?.market) {
      setMarket(tickets[0].market.toUpperCase());
    }
  }, [tickets]);

  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const completedTickets = currentItems.filter(ticket => ticket.isSettled);
  const nonCompletedTickets = currentItems.filter(ticket => !ticket.isSettled);
  const sortedCompletedTickets = completedTickets.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const finalTickets = [...nonCompletedTickets, ...sortedCompletedTickets];

  const toggleFilter = (filterName) => {
    setActiveFilter(activeFilter === filterName ? null : filterName); 
  };

  return (
    <Container className="mt-3">
      <h3 className="d-flex justify-content-center mb-3 font-family" style={{ color: '#E10174' }}>
        {text} Tickets from Market&nbsp;
      </h3>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
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
                <th key={header} className="text-center" style={{ backgroundColor: "#E10174", color: "white" }}>
                  {header}
                  {header === "Status" && (
                    <>
                      <IoFilterSharp
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => toggleFilter('status')}
                      />
                      {activeFilter === 'status' && (
                        <div className="dropdown-menu show">
                          <StatusFilter
                            statusFilter={statusFilter}
                            setCurrentPage={setCurrentPage}
                            setStatusFilter={setStatusFilter}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {header === "Full Name" && (
                    <>
                      <IoFilterSharp
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => toggleFilter('fullname')}
                      />
                      {activeFilter === 'fullname' && (
                        <div className="dropdown-menu show">
                          <FullnameFilter
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
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => toggleFilter('ntid')}
                      />
                      {activeFilter === 'ntid' && (
                        <div className="dropdown-menu show">
                          <NtidFilter
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
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => toggleFilter('createdAt')}
                      />
                      {activeFilter === 'createdAt' && (
                        <div className="dropdown-menu show">
                          <CreatedAt
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
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => toggleFilter('completedAt')}
                      />
                      {activeFilter === 'completedAt' && (
                        <div className="dropdown-menu show">
                          <CompletedAt
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
            {finalTickets.length > 0 ? (
              finalTickets.map((ticket, index) => (
                <TicketBody
                  key={index} // Assuming ticket has a unique 'id'
                  ticket={ticket}
                  index={index}
                  handleTicket={handleTicket}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              ))
            ) : (
              <tr>
                <td colSpan="8">No tickets available</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <PageCountStack
        filteredTickets={filteredTickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </Container>
  );
};

export default TicketsTable;
