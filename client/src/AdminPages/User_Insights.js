import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/apiRequest";
import { MdDownload } from "react-icons/md";
import { IoFilterSharp } from "react-icons/io5";
import PageCountStack from "../universalComponents/PageCountStack";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../universalComponents/MyContext";
import * as XLSX from "xlsx";
import FullNameFilter from "../universalComponents/FullNameFilter";
import NtidFilter from "../universalComponents/NtidFilter";
import { Col, Row } from "react-bootstrap";
import DateRangeFilter from "../universalComponents/DateRangeFilter";
import "../styles/UserInsights.css"; // New custom CSS file
import {Container} from "react-bootstrap";

function UserInsights() {
  const [userStats, setUserStats] = useState([]);
  const [fullnameFilter, setFullnameFilter] = useState("");
  const [ntidFilter, setNtidFilter] = useState("");
  const [fullnameToggle, setFullnameToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const navigate = useNavigate();
  const { setNtid, setStatusId, setDataDates } = useMyContext();
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    let isMounted = true;

    const fetchUserStats = async () => {
      const { startDate, endDate } = dates;
      const params = { startDate, endDate };
      setLoading(true);
      try {
        const response = await apiRequest.get("/createTickets/userinsights", { params });
        if (isMounted) setUserStats(response.data);
      } catch (error) {
        console.error("Error fetching user ticket stats:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserStats();

    return () => {
      isMounted = false;
    };
  }, [dates]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  const filteredUserStats = userStats.filter(
    (user) =>
      user.fullname.toLowerCase().includes(fullnameFilter.toLowerCase()) &&
      user.ntid.toLowerCase().includes(ntidFilter.toLowerCase())
  );

  const currentItems = filteredUserStats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTotalTickets = (AdminsDatantid, status) => () => {
    setNtid(AdminsDatantid);
    localStorage.setItem("adminntid", AdminsDatantid);
    setStatusId(status);
    localStorage.setItem("statusId", status);

    if (dates) {
      setDataDates(dates);
      localStorage.setItem("dates", JSON.stringify(dates));
    }
    if (AdminsDatantid) {
      navigate("/totalusertickets");
    } else {
      console.error("NTID is not available");
    }
  };

  const exportToExcel = () => {
    const data = filteredUserStats.map(({ ntid, fullname, ticketStats }) => ({
      ntid,
      fullName: fullname,
      totalTickets: ticketStats.totalTickets,
      new: ticketStats.new || 0,
      opened: ticketStats.opened || 0,
      inProgress: ticketStats.inprogress || 0,
      reopened: ticketStats.reopened || 0,
      completed: ticketStats.completed || 0,
      requestReopen: ticketStats.requestreopenCount || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "User Insights");
    XLSX.writeFile(wb, "User_Insights.xlsx");
  };

  const handleFullnameFilterClick = () => setFullnameToggle(!fullnameToggle);
  const handleNTIDFilterClick = () => setNtidFilterToggle(!ntidFilterToggle);
  const handleDataFromChild = (startDate, endDate) => setDates({ startDate, endDate });

  return (
    <Container fluid className="user-insights-container">
      <h3 className="text-center my-4 text-pink fw-bold">Users Tickets Insights</h3>
      <Row className="justify-content-between mb-3">
        <Col xs={12} md="auto" className="mb-2 mb-md-0">
          <DateRangeFilter sendDatesToParent={handleDataFromChild} />
        </Col>
        <Col xs={12} md="auto">
          <button
            className="btn export-btn"
            onClick={exportToExcel}
            disabled={filteredUserStats.length === 0}
          >
            <MdDownload className="me-1" /> Download as Excel
          </button>
        </Col>
      </Row>

      <div className="table-wrapper" style={{height:'800px'}}>
        <table className="table table-custom">
          <thead className="table-header">
            <tr>
              <th>SINo</th>
              <th>
                Email / NTID
                <div className="filter-icon">
                  <IoFilterSharp onClick={handleNTIDFilterClick} />
                  {ntidFilterToggle && (
                    <div className="filter-dropdown">
                      <NtidFilter
                        setNtidFilterToggle={setNtidFilterToggle}
                        ntidFilter={ntidFilter}
                        setntidFilter={setNtidFilter}
                        setCurrentPage={setCurrentPage}
                      />
                    </div>
                  )}
                </div>
              </th>
              <th>
                Fullname
                <div className="filter-icon">
                  <IoFilterSharp onClick={handleFullnameFilterClick} />
                  {fullnameToggle && (
                    <div className="filter-dropdown">
                      <FullNameFilter
                        setFullnameFilterToggle={setFullnameToggle}
                        fullnameFilter={fullnameFilter}
                        setFullnameFilter={setFullnameFilter}
                        setCurrentPage={setCurrentPage}
                      />
                    </div>
                  )}
                </div>
              </th>
              <th>Total</th>
              <th>New</th>
              <th>Opened</th>
              <th>In Progress</th>
              <th>Completed</th>
              <th>Reopened</th>
              <th className="request-reopen-header">Request Reopen</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentItems.length > 0 ? (
              currentItems.map(({ ntid, fullname, ticketStats }, index) => (
                <tr key={ntid}>
                  <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td
                    className="text-center clickable"
                    onClick={handleTotalTickets(ntid, "0")}
                  >
                    {ntid}
                  </td>
                  <td
                    className="text-center clickable text-capitalize"
                    onClick={handleTotalTickets(ntid, "0")}
                  >
                    {fullname.toLowerCase()}
                  </td>
                  <td
                    className="text-center clickable"
                    onClick={handleTotalTickets(ntid, "0")}
                  >
                    {ticketStats.totalTickets}
                  </td>
                  <td
                    className="text-center clickable"
                    onClick={handleTotalTickets(ntid, "1")}
                  >
                    {ticketStats.new || 0}
                  </td>
                  <td
                    className="text-center clickable"
                    onClick={handleTotalTickets(ntid, "2")}
                  >
                    {ticketStats.opened || 0}
                  </td>
                  <td
                    className="text-center clickable"
                    onClick={handleTotalTickets(ntid, "3")}
                  >
                    {ticketStats.inprogress || 0}
                  </td>
                  <td
                    className="text-center clickable"
                    onClick={handleTotalTickets(ntid, "4")}
                  >
                    {ticketStats.completed || 0}
                  </td>
                  <td
                    className="text-center clickable"
                    onClick={handleTotalTickets(ntid, "5")}
                  >
                    {ticketStats.reopened || 0}
                  </td>
                  <td className="text-center">{ticketStats.requestreopenCount || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center no-data">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {currentItems.length > 0 && (
        <PageCountStack
          itemsPerPage={itemsPerPage}
          filteredTickets={filteredUserStats}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </Container>
  );
}

export default UserInsights;