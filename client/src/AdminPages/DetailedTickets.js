import React, { useEffect, useState, useRef } from "react";
import { Container, Table, Row, Col } from "react-bootstrap";
import "../styles/loader.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchTickets } from "../redux/ticketSlice";
import { fetchIndividualTickets, setId } from "../redux/marketSlice";
import getMarkets from "../universalComponents/GetMarkets";
import { IoIosArrowDown } from "react-icons/io";
import PageCountStack from "../universalComponents/PageCountStack";
import FilterLogic from "../universalComponents/FilteringLogic";
import TicketBody from "../universalComponents/TicketBody";
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from "../universalComponents/FullNameFilter";
import StatusFilter from "../universalComponents/StatusFilter";
import getDecodedToken from "../universalComponents/decodeToken";
import { useMyContext } from "../universalComponents/MyContext";
// import animationData from "../universalComponents/Animation.json";
// import { Player } from "@lottiefiles/react-lottie-player";
import { FaExclamationCircle } from 'react-icons/fa';

const ShowTickets = () => {
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fullnameFilter, setFullnameFilter] = useState("");
  const [marketData, setMarketData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [market, setMarket] = useState("");
  const [ntidFilter, setntidFilter] = useState("");
  const [itemsPerPage] = useState(30);
  const dropdownRef = useRef(null);
  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);
  const { Dates } = useMyContext();
  // console.log(Dates,)
  const handleFullnameFilterClick = () => {
    setFullnameToggle(!fullnameToggle);
    setStatusToggle(false);
    setNtidFilterToggle(false);
    setCreatedAtToggle(false);
    setCompletedAtToggle(false);
  };
  const department = getDecodedToken().department;

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

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  const selectedMarket = useSelector((state) => state.market.selectedMarket);
  const { tickets, loading } = useSelector((state) => state.tickets);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await getMarkets();
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };
    fetchMarketData();
  }, []);

  useEffect(() => {
    const storedMarket = localStorage.getItem("marketData");
    if (storedMarket) {
      setMarket(storedMarket.toUpperCase());
      if (!selectedMarket) {
        dispatch(fetchTickets(storedMarket.toLowerCase()));
      }
    }
    if (selectedMarket) {
      localStorage.setItem("marketData", selectedMarket.toLowerCase());
      dispatch(fetchTickets(selectedMarket.toLowerCase()));
    }
  }, [selectedMarket, dispatch]);

  // Computed filtered tickets
  const filteredTickets = FilterLogic(
    tickets.filter((item) => {
      const storedDates = JSON.parse(localStorage.getItem("dates")) || {};
      const { startDate, endDate } = Dates || storedDates;
      if (startDate && endDate) {
        const ticketDate = new Date(item.createdAt).toISOString().slice(0, 10);
        return ticketDate >= startDate && ticketDate <= endDate;
      }
      return true;
    }),
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
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleMarketChange = (event) => {
    const selectedMarket = event.currentTarget.getAttribute("data-value");
    setMarket(selectedMarket.toUpperCase());
    dispatch(fetchTickets(selectedMarket.toLowerCase()));
    setDropdownVisible(false);
  };

  return (
    <Container fluid className="mt-2">
      <Row
        className="mb-1 font-family text-capitalize align-items-center"
        style={{ color: "#E10174" }}
      >
        <Col xs={12} md={6} className="d-flex gap-0">
          <Col xs={11} md={9}>
            <h3>Tickets from Market {market.toLowerCase()}</h3>
          </Col>
          <Col
            xs={1}
            md={3}
            className="position-relative"
            ref={dropdownRef}
            style={{ right: "100px" }}
          >
            <button
              onClick={toggleDropdown}
              className="border-0 fs-4 bg-transparent text-primary"
            >
              <IoIosArrowDown />
            </button>
            {dropdownVisible && (
              <div
                className="dropdown-menu show position-absolute overflow-auto"
                style={{ height: "50vh" }}
              >
                {marketData.map((data, index) => (
                  <div
                    style={{ cursor: "pointer" }}
                    className="dropdown-item shadow-lg text-primary fw-medium"
                    onClick={handleMarketChange}
                    data-value={data.market.toLowerCase()}
                    key={index}
                  >
                    {data.market.toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </Col>
        </Col>
      </Row>

      {loading ? (
        <div className="loader d-flex align-items-center justify-content-center vh-80"></div>
      ) : (
        <Table bordered hover responsive className="table-sm">
          <thead>
            <tr>
              {[
                "SC.No",
                " Email / NTID",
                "Full Name",
                "Status",
                "CreatedAt",
                department === "SuperAdmin" && "Now At",
                department === "SuperAdmin" && "completedBy",
                "CompletedAt",
                "Duration",
                "Details",
                department === "SuperAdmin" && "Delete",
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
                            setFullnameFilterToggle={setFullnameToggle}
                            fullnameFilter={fullnameFilter}
                            setFullnameFilter={setFullnameFilter}
                            setCurrentPage={setCurrentPage}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {header === "NTID / Email" && (
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
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((ticket, index) => (
                <TicketBody
                  ticket={ticket}
                  index={index}
                  handleTicket={handleTicket}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  key={ticket.TicketId}
                  // onDelete={handleDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center fw-medium">
                  <div className='d-flex justify-content-center align-items-center' style={{ height: '60vh' }}>
                    <div className='text-center'>
                      <FaExclamationCircle className='text-secondary' style={{ fontSize: '5rem', marginBottom: '1rem' }} />
                      <p className='fs-1 fw-bolder text-muted'>No data available ...</p>
                      <p className='text-muted'>Please check back later or try refreshing the page.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
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
};

export default ShowTickets;
