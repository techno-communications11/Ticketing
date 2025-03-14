import React, { useEffect, useState, useRef } from "react";
import { Container, Table, Row, Col, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchTickets } from "../redux/ticketSlice";
import { fetchIndividualTickets, setId } from "../redux/marketSlice";
import getMarkets from "../universalComponents/GetMarkets";
// import { IoIosArrowDown } from "react-icons/io";
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
import { FaExclamationCircle } from "react-icons/fa";
import '../styles/ShowTickets.css'

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
  const department = getDecodedToken().department;

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

  // const toggleDropdown = () => {
  //   setDropdownVisible(!dropdownVisible);
  // };

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
    <Container fluid className="mt-4">
      {/* Header Section */}
      <Row className="mb-3 align-items-center">
        <Col xs={12} md={6} className="d-flex align-items-center">
          <h3 className="fw-bold text-dark me-3">
            Tickets from Market: <span style={{ color: "#E10174" }}>{market || "Select Market"}</span>
          </h3>
          <Dropdown ref={dropdownRef}>
            <Dropdown.Toggle
              variant="outline-pink"
              className="border-0 text-dark fw-medium d-flex align-items-center"
              style={{ backgroundColor: "transparent" }}
            >
              {/* <IoIosArrowDown className="ms-2" style={{ color: "#E10174" }} /> */}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-lg" style={{ maxHeight: "50vh", overflowY: "auto" }}>
              {marketData.map((data, index) => (
                <Dropdown.Item
                  key={index}
                  data-value={data.market.toLowerCase()}
                  onClick={handleMarketChange}
                  className="text-dark fw-medium"
                  style={{ color: "#E10174" }}
                >
                  {data.market.toUpperCase()}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {/* Table Section */}
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
                  department === "SuperAdmin" && "Now At",
                  department === "SuperAdmin" && "CompletedBy",
                  "CompletedAt",
                  "Duration",
                  "Details",
                  department === "SuperAdmin" && "Delete",
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
                    ticket={ticket}
                    index={index}
                    handleTicket={handleTicket}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    key={ticket.TicketId}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-5">
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

export default ShowTickets;