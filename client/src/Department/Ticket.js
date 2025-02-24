import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import TicketBody from '../universalComponents/TicketBody';
import PageCountStack from '../universalComponents/PageCountStack';
import { Container } from 'react-bootstrap';
import getDecodedToken from '../universalComponents/decodeToken';
import FilterLogic from '../universalComponents/FilteringLogic';
import { useDispatch } from 'react-redux';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import { useMyContext } from "../universalComponents/MyContext";
import StatusFilter from "../universalComponents/StatusFilter";
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from "../universalComponents/FullNameFilter";
import { FaExclamationCircle } from 'react-icons/fa';
import '../styles/TicketTable.css';

function Ticket({ status, openedBy, fullname }) {
  const [tickets, setTickets] = useState([]);
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ntidFilter, setntidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const itemsPerPage = 30;
  let { statusId } = useMyContext();

  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);

  useEffect(() => {
    const ntid = getDecodedToken()?.ntid;

    const fetchUserTickets = async () => {
      try {
        const response = await apiRequest.get('/createTickets/getdepartmenttickets', {
          params: { ntid, statusId }
        });

        let fetchedTickets = response.data;

        if (openedBy === null && status === '3' && fullname === null) {
          fetchedTickets = fetchedTickets.filter(ticket =>
            ticket.openedBy === null &&
            (ticket.status.id === '3' || ticket.status.id === '1' || ticket.status.id === '5') &&
            ticket.assignToTeam === null
          );
        } else if (openedBy && status === '3' && fullname === null) {
          fetchedTickets = fetchedTickets.filter(ticket =>
            (ticket.status.id !== '4') &&
            ticket.openedBy === openedBy
          );
        } else if (status === '4') {
          fetchedTickets = fetchedTickets.filter(ticket =>
            ticket.status.id === '4' &&
            ticket.openedBy === openedBy
          );
        } else if (fullname) {
          fetchedTickets = fetchedTickets.filter(ticket =>
            ticket.assignToTeam === fullname && ticket.status.id !== '4' && ticket.openedBy === null
          );
        }

        setTickets(fetchedTickets);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      }
    };

    fetchUserTickets();
  }, [statusId, openedBy, fullname]);

  const handleTicket = (id) => {
    localStorage.setItem('selectedId', id);
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

  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Container fluid>
      {currentItems.length > 0 ? (
        <div className="table-container">
          <h3 className="my-2 d-flex justify-content-center my-1" style={{ color: '#E10174' }}>Tickets</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
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
                    <th
                      key={header}
                      className="text-center sticky-header"
                      style={{ backgroundColor: "#E10174", color: "white" }}
                    >
                      {header}
                      {header === "Status" && (
                        <>
                          <IoFilterSharp
                            style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                            onClick={() => setStatusToggle(!statusToggle)}
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
                            style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                            onClick={() => setFullnameToggle(!fullnameToggle)}
                          />
                          {fullnameToggle && (
                            <div className="dropdown-menu show">
                              <FullnameFilter
                                fullnameFilter={fullnameFilter}
                                setFullnameFilter={setFullnameFilter}
                                setCurrentPage={setCurrentPage}
                                setFullnameFilterToggle={setFullnameFilter}
                              />
                            </div>
                          )}
                        </>
                      )}
                      {header === "NTID" && (
                        <>
                          <IoFilterSharp
                            style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                            onClick={() => setNtidFilterToggle(!ntidFilterToggle)}
                          />
                          {ntidFilterToggle && (
                            <div className="dropdown-menu show">
                              <NtidFilter
                                ntidFilter={ntidFilter}
                                setntidFilter={setntidFilter}
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
                            style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                            onClick={() => setCreatedAtToggle(!createdAtToggle)}
                          />
                          {createdAtToggle && (
                            <div className="dropdown-menu show">
                              <CreatedAt
                                createdAt={createdAt}
                                setCreatedAt={setCreatedAt}
                                setCurrentPage={setCurrentPage}
                                setCreatedAtToggle={setCreatedAtToggle}
                              />
                            </div>
                          )}
                        </>
                      )}
                      {header === "CompletedAt" && (
                        <>
                          <BsCalendar2DateFill
                            style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                            onClick={() => setCompletedAtToggle(!completedAtToggle)}
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
              <tbody className="scrollable-body">
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
        <div className='d-flex justify-content-center align-items-center' style={{ height: '80vh' }}>
          <div className='text-center'>
            <FaExclamationCircle className='text-secondary' style={{ fontSize: '5rem', marginBottom: '1rem' }} />
            <p className='fs-1 fw-bolder text-muted'>No data available ...</p>
            <p className='text-muted'>Please check back later or try refreshing the page.</p>
          </div>
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