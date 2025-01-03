import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/apiRequest";
import { MdDownload } from "react-icons/md";
import { IoFilterSharp } from "react-icons/io5"; // Added IoFilterSharp import
import PageCountStack from "../universalComponents/PageCountStack";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../universalComponents/MyContext";
import * as XLSX from "xlsx"; // Import XLSX
import "../styles/loader.css";
import FullNameFilter from "../universalComponents/FullNameFilter"; // Assuming these are components for filtering
import NtidFilter from "../universalComponents//NtidFilter";
import { Col, Row } from "react-bootstrap";
import DateRangeFilter from "../universalComponents/DateRangeFilter";

function UserInsights() {
  const [userStats, setUserStats] = useState([]);
  const [fullnameFilter, setFullnameFilter] = useState("");
  const [ntidFilter, setNtidFilter] = useState("");
  const [fullnameToggle, setFullnameToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const navigate = useNavigate();
  const { setNtid,setStatusId,setDataDates } = useMyContext();
  const [loading, setLoading] = useState(false);
   const [dates, setDates] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    let isMounted = true;

    const fetchUserStats = async () => {
      const {startDate,endDate}=dates;
     const params={
      startDate:startDate,
      endDate:endDate
     }
      setLoading(true);
      try {
        const response = await apiRequest.get("/createTickets/userinsights",{params});
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
    return <div className="loader"></div>;
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

  const handleTotalTickets = (AdminsDatantid,status) => () => {
    setNtid(AdminsDatantid);
    setStatusId(status)
     
     if(dates){
      // console.log(dates,'lllllllllllllooooooooooooollllllllllllll')
      setDataDates(dates);
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
  const handleDataFromChild=(startDate, endDate)=>setDates({ startDate, endDate })

  return (
    <div className="container">
      <h3 className="text-center" style={{ color: "#E10174" }}>
        Users Tickets Insights
      </h3>
      <Row className="d-flex justify-content-between mb-2">
      <Col xs={12} md="auto">
      <DateRangeFilter  sendDatesToParent={handleDataFromChild}/>
      </Col>
       <Col xs={12} md="auto">
       <button
        className="btn btn-outline-success fw-medium"
        onClick={exportToExcel}
        disabled={filteredUserStats.length === 0}
      >
        <MdDownload /> Download as Excel File
      </button>
      </Col>
      </Row>

      

      <table className="table table-bordered table-striped table-sm">
        <thead className="table-light">
          <tr className="tablerow">
            <th>SINo</th>
            <th>
              Email / NTID
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
                      setntidFilter={setNtidFilter}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                )}
              </>
            </th>
            <th>
              Fullname
              <>
                <IoFilterSharp
                  style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                  onClick={handleFullnameFilterClick}
                />
                {fullnameToggle && (
                  <div className="dropdown-menu show">
                    <FullNameFilter
                      setFullnameFilterToggle={setFullnameToggle}
                      fullnameFilter={fullnameFilter}
                      setFullnameFilter={setFullnameFilter}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                )}
              </>
            </th>
            <th>Total</th>
            <th>New</th>
            <th>Opened</th>
            <th>InProgress</th>
            <th>Completed</th>
            <th>Reopened</th>
            <th style={{ backgroundColor: "#117a65" }}>Request Reopen</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(({ ntid, fullname, ticketStats }, index) => (
            <tr key={ntid}>
              <td className="text-center">{index + 1}</td>
              <td
                className="text-center"
                onClick={handleTotalTickets(ntid,"0")}
                style={{ cursor: "pointer" }}
              >
                {ntid}
              </td>
              <td
                className="text-center text-capitalize"
                onClick={handleTotalTickets(ntid,"0")}
                style={{ cursor: "pointer" }}
              >
                {fullname.toLowerCase()}
              </td>
              <td
                className="text-center"
                onClick={handleTotalTickets(ntid,"0")}
                style={{ cursor: "pointer" }}
              >
                {ticketStats.totalTickets}
              </td>
              <td className="text-center" onClick={handleTotalTickets(ntid,"1")} style={{ cursor: "pointer" }}>{ticketStats.new || 0}</td>
              <td className="text-center" onClick={handleTotalTickets(ntid,"2")} style={{ cursor: "pointer" }}>{ticketStats.opened || 0}</td>
              <td className="text-center" onClick={handleTotalTickets(ntid,"3")} style={{ cursor: "pointer" }}>{ticketStats.inprogress || 0}</td>
              <td className="text-center" onClick={handleTotalTickets(ntid,"4")} style={{ cursor: "pointer" }}>{ticketStats.completed || 0}</td>
              <td className="text-center" onClick={handleTotalTickets(ntid,"5")} style={{ cursor: "pointer" }}>{ticketStats.reopened || 0}</td>
              <td className="text-center" >
                {ticketStats.requestreopenCount || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PageCountStack
        itemsPerPage={itemsPerPage}
        filteredTickets={filteredUserStats}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default UserInsights;
