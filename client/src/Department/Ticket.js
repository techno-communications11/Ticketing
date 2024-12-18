import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import Filtering from '../universalComponents/Filtering';
import TicketBody from '../universalComponents/TicketBody';
import PageCountStack from '../universalComponents/PageCountStack';
import { Container, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
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
import '../styles/TicketTable.css'

function Ticket({ status,openedBy,fullname, }) {
  const [tickets, setTickets] = useState([]);
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ntidFilter, setntidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const itemsPerPage = 30;
  let {  statusId } = useMyContext();

  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);

  // console.log(ntid,"ntids")
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

  useEffect(() => {
    const ntid = getDecodedToken()?.ntid;
    // const usersId = getDecodedToken()?.id;
  
    const fetchUserTickets = async () => {
      try {
        const response = await apiRequest.get('/createTickets/getdepartmenttickets', {
          params: { ntid, statusId }
        });
  
        let fetchedTickets = response.data;
        // console.log(response.data)
  
        // Apply filters based on props
        if (openedBy === null && status === '3' && fullname === null) {
          // Filter tickets for DepartmentNew - tickets that are not yet opened
          fetchedTickets = fetchedTickets.filter(ticket => 
            ticket.openedBy === null &&
            (ticket.status.id === '3' || ticket.status.id === '1' || ticket.status.id==='5') &&
            ticket.assignToTeam === null 
            // &&
            // ticket.status.name !== 'completed'
          );
        }
         else if (openedBy && status === '3' && fullname === null) {
          // For DepartmentOpened - tickets opened by a specific user with status 3
          fetchedTickets = fetchedTickets.filter(ticket =>
             (ticket.status.id !== '4') &&

            ticket.openedBy === openedBy
          );
        } else if ( status === '4') {
          // For DepartmentWiseTickets - tickets opened by a specific user with status 4
          fetchedTickets = fetchedTickets.filter(ticket =>
            ticket.status.id === '4'
            &&
            ticket.openedBy === openedBy
          );
        }  else if (fullname) {
          fetchedTickets = fetchedTickets.filter(ticket =>
            ticket.assignToTeam === fullname && ticket.status.id!=='4'&&ticket.openedBy===null
          );
        }
  
        setTickets(fetchedTickets);
  
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast.error('Failed to fetch tickets');
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
    <Container className="mt-1">
      <h3 className="my-2 d-flex justify-content-center my-3" style={{ color: '#E10174' }}>Tickets</h3>
     
      {currentItems.length > 0 ? (
        <div className="table-responsive container-fluid">
          <table className="table table-bordered table-hover">
            <thead>
            <tr>
                {[
                  "SC.No",
                  "Email",
                  "Full Name",
                  "Status",
                  "CreatedAt",
                  "CompletedAt",
                  "Duration",
                  "Details",
                ].map((header) => (
                  <th
                    key={header}
                    className="text-center"
                    style={{ backgroundColor: "#E10174", color: "white" }}
                  >
                    {header}
                    {header === "Status" && (
                      <>
                        <IoFilterSharp
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleStatusFilterClick}
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
                          onClick={handleFullnameFilterClick}
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
                          onClick={handleNTIDFilterClick}
                        />

                        {ntidFilterToggle && (
                          <div className="dropdown-menu show">
                            <NtidFilter
                              ntidFilter={ntidFilter}
                              setntidFilter={setntidFilter}
                              setCurrentPage={setCurrentPage}
                              setNtidFilterToggle={setCompletedAtToggle}
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
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleCompletedFilterClick}
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
      ) : (
        <p className="text-center">No tickets found.</p>
      )}

<PageCountStack
        filteredTickets={filteredTickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </Container>
  );
}

export default Ticket;
