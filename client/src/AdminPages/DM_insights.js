import React, { useEffect, useState ,useRef} from "react";
import { apiRequest } from "../lib/apiRequest";
import { Col, Form,Row } from "react-bootstrap";
import { MdFilterList } from "react-icons/md";
import PageCountStack from "../universalComponents/PageCountStack";
import "../styles/TicketTable.css";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../universalComponents/MyContext";
import * as XLSX from "xlsx";
import { MdDownload } from "react-icons/md";
import '../styles/loader.css'
import { useOutsideClick } from "../universalComponents/useOutsideClick";
import DateRangeFilter from "../universalComponents/DateRangeFilter";

function DM_insights() {
  const [dmInsights, setDmInsights] = useState(null);
  const [filteredInsights, setFilteredInsights] = useState(null);
  const [filter, setFilter] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const navigate = useNavigate();
  const { setDm } = useMyContext();
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setIsFilterVisible(false));
  // const [dates, setDates] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await apiRequest.get("/createTickets/dminsights");
        setDmInsights(response.data);
        setFilteredInsights(response.data);
      } catch (error) {
        console.error("Error fetching DM insights:", error);
      }
    };
    fetchInsights();
  }, []);

  const handleFilterChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setFilter(searchTerm);
    const filteredData = Object.keys(dmInsights).reduce((acc, dm) => {
      if (dm.toLowerCase()?.includes(searchTerm)) {
        acc[dm] = dmInsights[dm];
      }
      return acc;
    }, {});

    setFilteredInsights(filteredData);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // const totalItems = filteredInsights
  //   ? Object.keys(filteredInsights).length
  //   : 0;
  const currentItems = filteredInsights
    ? Object.keys(filteredInsights).slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];

  const handleDmClick = (dm) => {
    setDm(dm);
    // setDataDates(dates)
    navigate("/dmtabs");
  };

  // Excel download function
  const downloadExcel = () => {
    const data = Object.keys(filteredInsights).map((dm) => {
      return {
        "DM Name": dm,
        "Total Tickets": filteredInsights[dm].totalTickets,
        New: filteredInsights[dm].new || 0,
        Opened: filteredInsights[dm].opened || 0,
        "In Progress": filteredInsights[dm].inProgress || 0,
        Reopened: filteredInsights[dm].reopened || 0,
        Completed: filteredInsights[dm].completed || 0,
        "Request Reopen": filteredInsights[dm].requestreopen || 0,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DM Insights");
    XLSX.writeFile(workbook, "DM_Insights.xlsx");
  };
  // const handleDataFromChild=(startDate, endDate)=>setDates({ startDate, endDate })
  return (
    <div className="container-fluid">
      <h3 className="text-center" style={{color:'#E10174'}}>DM's Tickets Insights</h3>
      <Row className="d-fex justify-content-between mb-2">
        {/* <Col xs={12} md="auto">
        <DateRangeFilter sendDatesToParent={handleDataFromChild}/>
        </Col> */}
        <Col xs={12}  md="auto">
        <button
        onClick={downloadExcel}
        className="btn btn-outline-success fw-medium"
      >
        <MdDownload /> Download as Excel File
      </button>
        </Col>
      </Row>
     
      {filteredInsights ? (
        <div className="table-responsive table-sm">
          <table className="table table-bordered table-striped table-sm">
            <thead className="thead-dark">
              <tr className="tablerow">
                <th style={{ backgroundColor: "#E10174" }}>SINO</th>
                <th style={{ backgroundColor: "#E10174" }} ref={dropdownRef}>
                  DM_Name
                  <MdFilterList
                    className="ms-2"
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                    style={{ cursor: "pointer", fontSize: "20px" }}
                  />
                  {isFilterVisible && (
                    <Form.Select
                      multiple
                      value={filter}
                      onChange={handleFilterChange}
                      className="mt-1 dropdown-menu show shadow-none "
                      style={{ width: "auto", height: "auto" }}
                    >
                      {currentItems.map((dm) => (
                        <option
                          key={dm}
                          value={dm}
                          className="text-center fw-medium shadow-sm text-primary text-center"
                        >
                          {dm}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </th>
                <th style={{ backgroundColor: "#E10174" }}>Total</th>
                <th style={{ backgroundColor: "#E10174" }}>New</th>
                <th style={{ backgroundColor: "#E10174" }}>Opened</th>
                <th style={{ backgroundColor: "#E10174" }}>InProgress</th>
                <th style={{ backgroundColor: "#E10174" }}>Reopened</th>
                <th style={{ backgroundColor: "#E10174" }}>Completed</th>
                <th style={{ backgroundColor: "#117a65" }}>Request_Reopen</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((dm, index) => (
                <tr key={dm} className="tablerow">
                  <td>{index + 1}</td>
                  <td
                    className="text-centre"
                    onClick={() => handleDmClick(dm)}
                    style={{ cursor: "pointer" }}
                  >
                    {dm}
                  </td>
                  <td className="text-centre">
                    {filteredInsights[dm].totalTickets}
                  </td>
                  <td className="text-centre">
                    {filteredInsights[dm].new || 0}
                  </td>
                  <td className="text-centre">
                    {filteredInsights[dm].opened || 0}
                  </td>
                  <td className="text-centre">
                    {filteredInsights[dm].inProgress || 0}
                  </td>
                  <td className="text-centre">
                    {filteredInsights[dm].reopened || 0}
                  </td>
                  <td className="text-centre">
                    {filteredInsights[dm].completed || 0}
                  </td>
                  <td className="text-centre">
                    {filteredInsights[dm].requestreopen || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Component */}
          <PageCountStack
            filteredTickets={currentItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      ) : (
        <div className="loader"></div>
      )}
    </div>
  );
}

export default DM_insights;
