import React, { useEffect, useState, useMemo } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setId, fetchIndividualTickets } from '../redux/marketSlice';
import PageCountStack from '../universalComponents/PageCountStack';
import '../styles/loader.css';
import { Container, Row, Col } from 'react-bootstrap';
import { fetchStatusWiseTickets, setMarketAndStatus } from '../redux/statusSlice';
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from '../universalComponents/FullNameFilter'
import FilterLogic from '../universalComponents/FilteringLogic';
import getDecodedToken from '../universalComponents/decodeToken';
import TicketBody from '../universalComponents/TicketBody';
import StatusFilter from '../universalComponents/StatusFilter';

function TotalUserTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [ntidFilter, setntidFilter] = useState("");
  const [fullnameFilter,setFullnameFilter]=useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const dispatch = useDispatch();
  const { ntid } = getDecodedToken();
  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);
  const handleFullnameFilterClick = () => {
    setFullnameToggle(!fullnameToggle)
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
    const fetchUserTickets = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get(`/createTickets/getmarkettickets?ntid=${ntid}`);
        setTickets(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast.error('Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };
    if (ntid) fetchUserTickets();
    else setLoading(false);
  }, [ntid]);
  const filteredTickets = FilterLogic(
    tickets || [], 
    ntidFilter || "", 
    createdAt || "", 
    completedAt || "", 
    statusFilter || "",
    fullnameFilter||""
  );

  let market = [...new Set(tickets.map(ticket => ticket.market))][0];
  // const filteredTickets = FilterLogic(tickets, ntidFilter, dateFilter, statusFilter)
  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const counts = {};
  tickets.forEach((ticket) => {
    const statusName = ticket.status.name;
    if (counts[statusName]) {
      counts[statusName] += 1;
    } else {
      counts[statusName] = 1;
    }
  });

  const handleStatusClick = (statusName) => {
    let statusId =
      statusName === 'new' ? '1' :
        statusName === 'opened' ? '2' :
          statusName === 'inprogress' ? '3' :
            statusName === 'completed' ? '4' :
              statusName === 'reopened' ? '5' :
               statusName === 'Total' ? '0' : '';

    localStorage.setItem('marketData', market);
    localStorage.setItem('statusData', statusId);
    dispatch(fetchStatusWiseTickets({ market, statusId }));
    dispatch(setMarketAndStatus({ market, statusId }));
  };

  if (loading) return <div className='loader'></div>;

  return (
    <Container className='mt-5'>
      <Row className="d-flex justify-content-center gap-2  my-2">
        <Col xs={12} lg={1} className='card text-center shadow-sm rounded p-1'>
          <Link to={"/opened"} onClick={() => handleStatusClick('Total')} className='text-decoration-none fw-medium text-black'>
            <h4>Total</h4>
            <h1 style={{ color: '#E10174' }}>{tickets.length || 0}</h1>
          </Link>
        </Col>

        {Object.entries(counts).map(([statusName, count], index) => (
          <Col key={index} xs={12} lg={2} className='card text-center shadow-sm p-1 rounded'>
            <Link to={"/opened"} onClick={() => handleStatusClick(statusName)} className='text-decoration-none fw-medium text-black'>
              <h4>{statusName || 0}</h4>
              <h1 style={{ color: '#E10174' }}>{count}</h1>
            </Link>
          </Col>
        ))}
      </Row>
      <h3 className='mt-1 d-flex justify-content-center text-capitalize fw-medium  mt-5' style={{ color: '#E10174' }}>
        Total Market Tickets
      </h3>


      {authenticated  && (
        <Row className="table-responsive container">
          <table className="table table-bordered table-hover">
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
                  <th
                    key={header}
                    className="text-center"
                    style={{ backgroundColor: "#E10174", color: "white" }}
                  >
                    {header}
                    {header === "Status" && (
                      <>
                        <IoFilterSharp
                          style={{ cursor: "pointer", marginLeft:'0.5rem' }}
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
                          style={{ cursor: "pointer", marginLeft:'0.5rem' }}
                          onClick={handleFullnameFilterClick}
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
                          style={{ cursor: "pointer",marginLeft:'0.5rem' }}
                          onClick={handleNTIDFilterClick}
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
                          style={{ cursor: "pointer",marginLeft:'0.5rem' }}
                          onClick={handleCreatedAtFilterClick}
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
                          style={{ cursor: "pointer",marginLeft:'0.5rem' }}
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
              {currentItems.length > 0&&currentItems.map((ticket, index) => (
                <TicketBody ticket={ticket}
                index={index} 
                handleTicket={handleTicket}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}/>
              ))}
            </tbody>
          </table>
          <PageCountStack
            filteredTickets={filteredTickets}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </Row>
      )}
    </Container>
  );
}

export default TotalUserTickets;  
