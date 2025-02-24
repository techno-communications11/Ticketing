import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import PageCountStack from '../universalComponents/PageCountStack';
import { fetchStatusWiseTickets, setMarketAndStatus } from '../redux/statusSlice';
import {jwtDecode} from 'jwt-decode';
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
import '../styles/TicketTable.css'
// import animationData from "../universalComponents/Animation.json";
// import { Player } from "@lottiefiles/react-lottie-player";


const TicketsTable = ({ statusIds, text,logedInuser }) => {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Filters and Toggles
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [ntidFilter, setNtidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState('');

  // Toggle States for Filters
  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);

  const token = localStorage.getItem("token");
  const userId = jwtDecode(token);

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
        // Fetch all tickets based on statusIds without filtering by openedBy yet
        const allTickets = await Promise.all(
          statusIds.map(statusId => dispatch(fetchStatusWiseTickets({ id: storedMarket, statusId })))
        );
        
        const combined = allTickets.flatMap(ticket => ticket.payload || []);
        
        // After fetching, filter the tickets based on `openedBy` and `statusIds`
        let filteredTickets = combined;
  
        // If `openedBy` is provided, filter tickets based on `openedBy`
        if (logedInuser) {
          filteredTickets = filteredTickets.filter(ticket => ticket.openedBy === logedInuser);
        }
  
        // Update state with the filtered tickets
        setTickets(filteredTickets);
      };
  
      fetchTickets();
      statusIds.forEach(statusId => dispatch(setMarketAndStatus({ id: storedMarket, statusId })));
      localStorage.setItem("hasFetched", true);
    }
  }, [statusIds, userId, logedInuser]); // Added `openedBy` as a dependency
  
  

  useEffect(() => {
    // Reset hasFetched on component unmount
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

  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const completedTickets = currentItems.filter(ticket => ticket.isSettled);
  const nonCompletedTickets = currentItems.filter(ticket => !ticket.isSettled);
  const sortedCompletedTickets = completedTickets.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const finalTickets = [...nonCompletedTickets, ...sortedCompletedTickets];

  return (
    <Container className="mt-3">
      {finalTickets.length>0&&<h3 className="d-flex justify-content-center mb-3 font-family" style={{ color: '#E10174' }}>
        {text} Tickets
      </h3>}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="sticky-thead">
            <tr>
              {["SC.No", "Email / NTID", "Full Name", "Status", "CreatedAt", "CompletedAt", "Duration", "Details"].map((header) => (
                <th key={header} className="text-center" style={{ backgroundColor: "#E10174", color: "white" }}>
                  {header}
                  {header === "Status" && (
                    <>
                      <IoFilterSharp
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => handleToggle(setStatusToggle, setNtidFilterToggle, setCreatedAtToggle, setCompletedAtToggle, setFullnameToggle)}
                      />
                      {statusToggle && (
                        <div className="dropdown-menu show">
                          <StatusFilter
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            setCurrentPage={setCurrentPage}
                            setStatusToggle={setStatusToggle}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {header === "Full Name" && (
                    <>
                      <IoFilterSharp
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => handleToggle(setFullnameToggle, setStatusToggle, setNtidFilterToggle, setCreatedAtToggle, setCompletedAtToggle)}
                      />
                      {fullnameToggle && (
                        <div className="dropdown-menu show">
                          <FullnameFilter
                            fullnameFilter={fullnameFilter}
                            setFullnameFilter={setFullnameFilter}
                            setCurrentPage={setCurrentPage}
                            setFullnameFilterToggle={setFullnameToggle}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {header === "NTID" && (
                    <>
                      <IoFilterSharp
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => handleToggle(setNtidFilterToggle, setStatusToggle, setCreatedAtToggle, setCompletedAtToggle, setFullnameToggle)}
                      />
                      {ntidFilterToggle && (
                        <div className="dropdown-menu show">
                          <NtidFilter
                            ntidFilter={ntidFilter}
                            setntidFilter={setNtidFilter}
                            setCurrentPage={setCurrentPage}
                            setNtidFilterToggle={setNtidFilterToggle}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {header === "CreatedAt" && (
                    <>
                      <BsCalendar2DateFill
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => handleToggle(setCreatedAtToggle, setStatusToggle, setNtidFilterToggle, setCompletedAtToggle, setFullnameToggle)}
                      />
                      {createdAtToggle && (
                        <div className="dropdown-menu show">
                          <CreatedAt
                            createdAt={createdAt}
                            setCreatedAt={setCreatedAt}
                            setCurrentPage={setCurrentPage}
                            setCreatedAtToggle={setCompletedAtToggle}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {header === "CompletedAt" && (
                    <>
                      <BsCalendar2DateFill
                        style={{ cursor: "pointer", marginLeft: '0.5rem' }}
                        onClick={() => handleToggle(setCompletedAtToggle, setStatusToggle, setNtidFilterToggle, setCreatedAtToggle, setFullnameToggle)}
                      />
                      {completedAtToggle && (
                        <div className="dropdown-menu show">
                          <CompletedAt
                            completedAt={completedAt}
                            setCompletedAt={setCompletedAt}
                            setCurrentPage={setCurrentPage}
                            setCompletedAtToggle={setCompletedAtToggle}
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
                  key={ticket.id || index} // Use unique 'id' or fallback to index
                  ticket={ticket}
                  index={index}
                  handleTicket={handleTicket}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              ))
            ) : (
              <tr>
                <td colSpan="8" className='text-center'>
                  no data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <PageCountStack
        filteredTickets={filteredTickets}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
};

export default TicketsTable;
