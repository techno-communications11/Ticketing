import React, { useState, useEffect, useCallback } from "react";
import { MdDownload, MdFilterList } from "react-icons/md";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { Table, Row, Col, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import getMarkets from "../universalComponents/GetMarkets";
import { setMarket } from "../redux/marketSlice";
import {
  fetchStatusWiseTickets,
  setMarketAndStatus,
} from "../redux/statusSlice";
import { apiRequest } from "../lib/apiRequest";
import PageCountStack from "../universalComponents/PageCountStack";
import { Container } from "react-bootstrap";
import MarketSelectDropdown from "../universalComponents/MarketSelectDropdown";

function MarketWise() {
  const [marketTicketCounts, setMarketTicketCounts] = useState({});
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false); // State for showing/hiding filter input
  const [selectedMarkets, setSelectedMarkets] = useState([]); // State for selected markets
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const safeNumber = (value) => (isNaN(value) ? 0 : value);

  const fetchMarketData = useCallback(async () => {
    try {
      const data = await getMarkets();
      setMarketData(data);
    } catch (err) {
      setError("Failed to load market data.");
    }
  }, []);

  const fetchMarketWiseStatus = useCallback(async () => {
    if (marketData.length > 0) {
      setLoading(true);
      try {
        const counts = await Promise.all(
          marketData.map(async (item) => {
            const response = await apiRequest.get(
              "/createTickets/marketwisestatus",
              { params: { market: item.market } }
            );
            return { market: item.market, counts: response.data };
          })
        );

        const marketTotals = counts.reduce((acc, { market, counts }) => {
          const total = Object.keys(counts)
            .filter((key) => key !== "market")
            .reduce((sum, key) => sum + (counts[key] || 0), 0);
          acc[market] = { total, ...counts };
          return acc;
        }, {});
        setMarketTicketCounts(marketTotals);
      } catch (error) {
        setError("Failed to fetch market-wise status.");
      } finally {
        setLoading(false);
      }
    }
  }, [marketData]);

  const handleMarketClick = (market) => {
    localStorage.setItem('market',market)
    dispatch(setMarket(market));
    setSelectedMarkets([market]);
  };

  const handleStatusClick = (market, statusId) => {
    localStorage.setItem('statusData',statusId)
    localStorage.setItem('market',market)
    dispatch(fetchStatusWiseTickets({ market, statusId }));
    dispatch(setMarketAndStatus({ market, statusId }));
  };

  const downloadStatus = () => {
    const dataArray = Object.entries(marketTicketCounts).map(
      ([market, counts]) => ({
        Market: market,
        Total: safeNumber(counts.total),
        New: safeNumber(counts.new),
        Opened: safeNumber(counts.opened),
        Inprogress: safeNumber(counts.inprogress),
        Completed: safeNumber(counts.completed),
        Reopened: safeNumber(counts.reopened),
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, "market_ticket_counts.xlsx");
  };

  // Download All Tickets as Excel
  const downloadTickets = async () => {
    try {
      const response = await apiRequest.get("/createTickets/all");
      const tickets = response.data;
      const worksheet = XLSX.utils.json_to_sheet(tickets);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
      XLSX.writeFile(workbook, "tickets.xlsx");
    } catch (error) {
      console.error("Error downloading tickets:", error);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  useEffect(() => {
    fetchMarketWiseStatus();
  }, [marketData, fetchMarketWiseStatus]);

  const filteredMarketCounts = Object.entries(marketTicketCounts).filter(
    ([market]) =>
      selectedMarkets.length === 0 || selectedMarkets.includes(market)
  );

  const currentItems = filteredMarketCounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container>
      <Row>
        {loading ? (
          <div className="loader"></div>
        ) : (
          <div>
            <Col md={12}>
              <h4
                className="d-flex justify-content-center font-family fw-medium"
                style={{ color: "#E10174" }}
              >
                Market Wise Ticket Counts
              </h4>

              <Row className="d-flex justify-content-center">
                <Col
                  md={12}
                  sm={12}
                  xs={12}
                  className="d-flex flex-wrap justify-content-start"
                >
                  <div className="d-flex flex-wrap w-100 gap-2">
                    <button
                      className="btn btn-outline-success fw-medium"
                      onClick={downloadStatus}
                    >
                      <MdDownload /> Download Status Count as Excel File
                    </button>
                    <button
                      className="btn btn-outline-success fw-medium"
                      onClick={downloadTickets}
                    >
                      <MdDownload /> Download Tickets as Excel File
                    </button>
                  </div>
                </Col>
              </Row>

              <div className="table-responsive-sm" style={{ zIndex: 0 }}>
                <Table
                  striped
                  bordered
                  hover
                  className="table align-middle text-center"
                >
                  <thead>
                    <tr>
                      <th
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        SINO
                      </th>

                      <th
                        className="text-decoration-none fw-medium"
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        Market
                        <MdFilterList
                          className="ms-2"
                          onClick={() => setIsFilterVisible(!isFilterVisible)}
                          style={{ cursor: "pointer" }}
                        />
                        {isFilterVisible && (
                          <MarketSelectDropdown
                            marketData={marketData}
                            isFilterVisible={isFilterVisible}
                            setIsFilterVisible={setIsFilterVisible}
                            selectedMarkets={selectedMarkets}
                            setSelectedMarkets={setSelectedMarkets}
                            setCurrentPage={setCurrentPage}
                          />
                        )}
                      </th>

                      <th
                        className="text-decoration-none fw-medium"
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        Total
                      </th>
                      <th
                        className="text-decoration-none fw-medium"
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        New
                      </th>
                      <th
                        className="text-decoration-none fw-medium"
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        Opened
                      </th>
                      <th
                        className="text-decoration-none fw-medium"
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        In Progress
                      </th>
                      <th
                        className="text-decoration-none fw-medium"
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        Completed
                      </th>
                      <th
                        className="text-decoration-none fw-medium"
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        Reopened
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(([market, counts], index) => (
                      <tr key={market}>
                    
                      <th   className="text-decoration-none fw-medium"  >{index + 1}</th>
                        <td>
                          <Link
                            to="/marketDetailedTicket"
                            onClick={() => handleMarketClick(market)}
                            className="text-capitalize text-decoration-none fw-medium text-black"
                          >
                            {market}
                          </Link>
                        </td>
                        <td>
                          <Link
                            to="/opened"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusClick(market, "0");
                            }}
                            className="text-decoration-none text-dark fw-medium"
                          >
                            {safeNumber(counts.total)}
                          </Link>
                        </td>
                        <td>
                          <Link
                            to="/opened"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusClick(market, "1");
                            }}
                            className="text-decoration-none text-dark fw-medium"
                          >
                            {safeNumber(counts.new)}
                          </Link>
                        </td>
                        <td>
                          <Link
                            to="/opened"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusClick(market, "2");
                            }}
                            className="text-decoration-none text-dark fw-medium"
                          >
                            {safeNumber(counts.opened)}
                          </Link>
                        </td>
                        <td>
                          <Link
                            to="/opened"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusClick(market, "3");
                            }}
                            className="text-decoration-none text-dark fw-medium"
                          >
                            {safeNumber(counts.inprogress)}
                          </Link>
                        </td>
                        <td>
                          <Link
                            to="/opened"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusClick(market, "4");
                            }}
                            className="text-decoration-none text-dark fw-medium"
                          >
                            {safeNumber(counts.completed)}
                          </Link>
                        </td>
                        <td>
                          <Link
                            to="/opened"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusClick(market, "5");
                            }}
                            className="text-decoration-none text-dark fw-medium"
                          >
                            {safeNumber(counts.reopened)}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <PageCountStack
                filteredTickets={filteredMarketCounts}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />
            </Col>
          </div>
        )}
      </Row>
    </Container>
  );
}

export default MarketWise;
