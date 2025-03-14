import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MdDownload, MdFilterList } from "react-icons/md";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { Table, Row, Col, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import getMarkets from "../universalComponents/GetMarkets";
import { setMarket } from "../redux/marketSlice";
import { apiRequest } from "../lib/apiRequest";
import PageCountStack from "../universalComponents/PageCountStack";
import { Container } from "react-bootstrap";
import MarketSelectDropdown from "../universalComponents/MarketSelectDropdown";
import DateRangeFilter from "../universalComponents/DateRangeFilter";
import { useMyContext } from "../universalComponents/MyContext";

function MarketWise() {
  const [marketTicketCounts, setMarketTicketCounts] = useState({});
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const {setDataDates}=useMyContext();

  const [dates, setDates] = useState({ startDate: '', endDate: '' });

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
    const {startDate,endDate}=dates;
    if (marketData.length > 0) {
      setLoading(true);
      try {
        const counts = await Promise.all(
          marketData.map(async (item) => {
            const response = await apiRequest.get("/createTickets/marketwisestatus", { params: { market: item.market,startDate,endDate } });
            // console.log(response.data,"ooooooop")
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
        // console.log(marketTicketCounts,"mmv")
        setMarketTicketCounts(marketTotals);
      } catch (error) {
        setError("Failed to fetch market-wise status.");
      } finally {
        setLoading(false);
      }
    }
  }, [marketData,dates]);

  const handleMarketClick = (market) => {
    localStorage.setItem("market", market);
    dispatch(setMarket(market));
    setSelectedMarkets([market]);
    if(dates){
      setDataDates(dates)
      localStorage.setItem('dates', JSON.stringify(dates));
    }
  };

  

  const downloadFile = (fileType) => {
    const dataArray = Object.entries(marketTicketCounts).map(([market, counts]) => ({
      Market: market,
      Total: safeNumber(counts.total),
      New: safeNumber(counts.new),
      Opened: safeNumber(counts.opened),
      Inprogress: safeNumber(counts.inprogress),
      Completed: safeNumber(counts.completed),
      Reopened: safeNumber(counts.reopened),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, fileType === "status" ? "Tickets" : "All Tickets");

    const fileName = fileType === "status" ? "market_ticket_counts.xlsx" : "tickets.xlsx";
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  useEffect(() => {
    fetchMarketWiseStatus();
  }, [marketData, fetchMarketWiseStatus]);

  const filteredMarketCounts = useMemo(() => {
    return Object.entries(marketTicketCounts).filter(([market]) =>
      selectedMarkets.length === 0 || selectedMarkets.includes(market)
    );
  }, [marketTicketCounts, selectedMarkets]);

  const currentItems = useMemo(() => {
    return filteredMarketCounts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredMarketCounts, currentPage]);
  const handleDataFromChild=(startDate, endDate)=>setDates({ startDate, endDate })

  return (
    <Container fluid>
      <Row>
        {loading ? (
          <div className="loader"></div>
        ) : (
          <Col md={12}>
            <h4 className="d-flex justify-content-center font-family fw-medium" style={{ color: "#E10174" }}>
              Market Wise Ticket Counts
            </h4>

            <Row className="d-flex justify-content-center mb-2">
              <Col  xs={12} md="auto">
              <DateRangeFilter sendDatesToParent={handleDataFromChild}/>
              </Col>
              <Col  xs={12} md="auto">
                <div className=" d-flex gap-2">
                  <button className="btn btn-outline-success fw-medium" onClick={() => downloadFile("status")}>
                    <MdDownload /> Download Status Count as Excel File
                  </button>
                  <button className="btn btn-outline-success fw-medium" onClick={() => downloadFile("tickets")}>
                    <MdDownload /> Download Tickets as Excel File
                  </button>
                </div>
              </Col>
            </Row>

            <div className="table-responsive-sm" style={{ zIndex: 0 }}>
              <Table striped bordered hover className="table align-middle text-center table-sm">
                <thead>
                  <tr>
                    <th style={{ backgroundColor: "#E10174", color: "white" }}>SINO</th>
                    <th style={{ backgroundColor: "#E10174", color: "white" }}>
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
                    <th style={{ backgroundColor: "#E10174", color: "white" }}>Total</th>
                    <th style={{ backgroundColor: "#E10174", color: "white" }}>New</th>
                    <th style={{ backgroundColor: "#E10174", color: "white" }}>Opened</th>
                    <th style={{ backgroundColor: "#E10174", color: "white" }}>In Progress</th>
                    <th style={{ backgroundColor: "#E10174", color: "white" }}>Completed</th>
                    <th style={{ backgroundColor: "#E10174", color: "white" }}>Reopened</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(([market, counts], index) => (
                    <tr key={market}>
                      <th className="fw-medium" style={{color:'#42526e'}}>{index + 1}</th>
                      <td>
                        <Link
                          to="/marketDetailedTicket"
                          onClick={() => handleMarketClick(market)}
                          style={{color:'#42526e'}}
                          className="text-capitalize text-decoration-none fw-medium "
                        >
                          {market}
                        </Link>
                      </td>
                      {["total", "new", "opened", "inprogress", "completed", "reopened"].map((status, idx) => (
                        <td key={idx}>
                          <span
                            className="text-decoration-none fw-medium"
                            style={{color:'#42526e'}}
                          >
                            {safeNumber(counts[status])}
                          </span>
                        </td>
                      ))}
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
        )}
      </Row>
    </Container>
  );
}

export default MarketWise;
