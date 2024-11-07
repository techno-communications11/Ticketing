import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import getDecodedToken from '../universalComponents/decodeToken';
import { apiRequest } from '../lib/apiRequest';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import FilterLogic from '../universalComponents/FilteringLogic';
import TicketBody from '../universalComponents/TicketBody';
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from '../universalComponents/FullNameFilter'
import StatusFilter from '../universalComponents/StatusFilter';
import PageCountStack from '../universalComponents/PageCountStack';

function RequestReopen() {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    statusToggle: false,
    ntidFilterToggle: false,
    createdAtToggle: false,
    completedAtToggle: false,
    fullnameToggle: false,
  });
  const [filterValues, setFilterValues] = useState({
    status: "",
    ntid: "",
    createdAt: "",
    completedAt: "",
    fullname: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  // Fetch tickets
  useEffect(() => {
    const ntid = getDecodedToken()?.ntid;
    const fetchTickets = async () => {
      try {
        const response = await apiRequest.get('/createTickets/get_request_reopen_tickets', {
          params: { ntid }
        });
        setTickets(response.data);
        console.log(response.data, "req,re");
      } catch (error) {
        console.error('Error fetching tickets:', error);
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

  // Handle filter toggle
  const handleFilterToggle = (filterName) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
      statusToggle: filterName === 'statusToggle' ? !prev.statusToggle : false,
      ntidFilterToggle: filterName === 'ntidFilterToggle' ? !prev.ntidFilterToggle : false,
      createdAtToggle: filterName === 'createdAtToggle' ? !prev.createdAtToggle : false,
      completedAtToggle: filterName === 'completedAtToggle' ? !prev.completedAtToggle : false,
      fullnameToggle: filterName === 'fullnameToggle' ? !prev.fullnameToggle : false,
    }));
  };

  const filteredTickets = FilterLogic(tickets || [], filterValues.ntid, filterValues.createdAt, filterValues.completedAt, filterValues.status, filterValues.fullname);

  return (
    <div className='container'>
      <h3 className='text-capitalize text-center my-3' style={{ color: '#E10174' }}>Reopen Requested Tickets</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            {["SC.No", "NTID", "Full Name", "Status", "CreatedAt", "CompletedAt", "Duration", "Details"].map((header) => (
              <th key={header} className="text-center" style={{ backgroundColor: "#E10174", color: "white" }}>
                {header}
                {header === "Status" && (
                  <>
                    <IoFilterSharp style={{ cursor: "pointer", marginLeft: '0.5rem' }} onClick={() => handleFilterToggle('statusToggle')} />
                    {filters.statusToggle && <StatusFilter statusFilter={filterValues.status} setStatusFilter={(status) => setFilterValues(prev => ({ ...prev, status }))} />}
                  </>
                )}
                {header === "Full Name" && (
                  <>
                    <IoFilterSharp style={{ cursor: "pointer", marginLeft: '0.5rem' }} onClick={() => handleFilterToggle('fullnameToggle')} />
                    {filters.fullnameToggle && <FullnameFilter fullnameFilter={filterValues.fullname} setFullnameFilter={(fullname) => setFilterValues(prev => ({ ...prev, fullname }))} />}
                  </>
                )}
                {header === "NTID" && (
                  <>
                    <IoFilterSharp style={{ cursor: "pointer", marginLeft: '0.5rem' }} onClick={() => handleFilterToggle('ntidFilterToggle')} />
                    {filters.ntidFilterToggle && <NtidFilter ntidFilter={filterValues.ntid} setntidFilter={(ntid) => setFilterValues(prev => ({ ...prev, ntid }))} />}
                  </>
                )}
                {header === "CreatedAt" && (
                  <>
                    <BsCalendar2DateFill style={{ cursor: "pointer", marginLeft: '0.5rem' }} onClick={() => handleFilterToggle('createdAtToggle')} />
                    {filters.createdAtToggle && <CreatedAt createdAt={filterValues.createdAt} setCreatedAt={(createdAt) => setFilterValues(prev => ({ ...prev, createdAt }))} />}
                  </>
                )}
                {header === "CompletedAt" && (
                  <>
                    <BsCalendar2DateFill style={{ cursor: "pointer", marginLeft: '0.5rem' }} onClick={() => handleFilterToggle('completedAtToggle')} />
                    {filters.completedAtToggle && <CompletedAt completedAt={filterValues.completedAt} setCompletedAt={(completedAt) => setFilterValues(prev => ({ ...prev, completedAt }))} />}
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket, index) => (
              <TicketBody key={index} 
              currentPage={currentPage}
              ticket={ticket} 
              index={index}
              handleTicket={handleTicket}
              itemsPerPage={itemsPerPage}
               />
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No tickets found.</td>
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
    </div>
  );
}

export default RequestReopen;
