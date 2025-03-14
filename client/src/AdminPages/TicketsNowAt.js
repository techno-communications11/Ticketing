import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/apiRequest";
import "../styles/loader.css";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../universalComponents/MyContext";
import DateRangeFilter from "../universalComponents/DateRangeFilter";
import { Row, Col, Button } from "react-bootstrap";
import { IoMdDownload } from "react-icons/io";
import * as XLSX from "xlsx"; // Import the xlsx library

function TicketsNowAt() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setDataStatusId, setDataFullName, setDataDates } = useMyContext();
  const [dates, setDates] = useState({ startDate: "", endDate: "" });

  // Fetch tickets when component mounts
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await apiRequest.get("/createTickets/ticketsnowat");
        // console.log(response.data, "Fetched tickets");
        setTickets(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching tickets.");
        setLoading(false);
      }
    };

    fetchTickets();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  if (loading) return <div className="loader"></div>;
  if (error) return <p>{error}</p>;

  // Group tickets by openedBy and count statuses
  const groupedTickets = tickets.reduce((acc, ticket) => {
    const { openedBy, status, createdAt } = ticket;
    const { startDate, endDate } = dates;

    // Check if the ticket's createdAt is within the date range
    if (startDate && endDate) {
      const ticketDate = new Date(createdAt.slice(0, 10)); // Assuming openedDate is in a valid date format
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Skip the ticket if it is outside the date range
      if (ticketDate < start || ticketDate > end) {
        return acc;
      }
    }

    // If the openedBy is not in the accumulator, add them
    if (!acc[openedBy]) {
      acc[openedBy] = {
        openedBy,
        statuses: {},
      };
    }

    // Count the status
    const statusName = status?.name || "Unknown";
    if (!acc[openedBy].statuses[statusName]) {
      acc[openedBy].statuses[statusName] = 0;
    }
    acc[openedBy].statuses[statusName] += 1;

    return acc;
  }, {});

  // Get all unique status names for the table header
  const allStatuses = [
    ...new Set(tickets.map((ticket) => ticket.status?.name)),
  ];

  const handleTicket = (status, username) => {
    // console.log(status, username, "jkp");

    // Map status to statusId
    const statusMap = {
      inprogress: "3",
      completed: "4",
      opened: "2",
      reopened: "5",
      new:'1',
    };

    const statusId = statusMap[status] || ""; // Default to an empty string if status is not in the map

    setDataStatusId(statusId); // Update the state with the calculated statusId
    setDataFullName(username); // Update the state with the username
    setDataDates(dates);
    // Navigate with the updated data
    navigate("/ticketnowatdata");
  };

  const handleDataFromChild = (startDate, endDate) =>
    setDates({ startDate, endDate });

  const downloadExcel = () => {
    const data = Object.values(groupedTickets).map((ticketGroup) => {
      const row = {
        "Opened By": ticketGroup.openedBy,
      };
      allStatuses.forEach((status) => {
        row[status] = ticketGroup.statuses[status] || 0; // Default to 0 if no tickets for this status
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data); // Convert JSON data to a worksheet
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, "Tickets"); // Append the worksheet to the workbook
    XLSX.writeFile(wb, "TicketsNowAt.xlsx"); // Download the file as "TicketsNowAt.xlsx"
  };

  return (
    <div className="container-fluid mt-1">
      <h4 className="text-center" style={{ color: "#E10174" }}>
        Tickets Now_At
      </h4>
      <Row className="align-items-center justify-content-between mb-2">
        <Col xs={12} md="auto">
          <DateRangeFilter sendDatesToParent={handleDataFromChild} />
        </Col>
        <Col xs={12} md="auto" className="text-end">
          <Button
            className="btn btn-outline-success bg-transparent text-success d-flex align-items-center"
            onClick={downloadExcel} // Add click handler for downloading
          >
            <IoMdDownload className="me-2" /> Download as Excel File
          </Button>
        </Col>
      </Row>

      {Object.keys(groupedTickets).length > 0 ? (
        <table className="table table-bordered table-striped table-responsive table-sm">
          <thead className="thead-dark">
            <tr>
              <th
                className="text-center"
                style={{ backgroundColor: "#E10174", color: "white" }}
              >
                SCNO
              </th>
              <th
                className="text-center"
                style={{ backgroundColor: "#E10174", color: "white" }}
              >
                Opened By
              </th>
              {/* Create a column for each status */}
              {allStatuses.map((status) => (
                <th
                  className="text-center"
                  style={{ backgroundColor: "#E10174", color: "white" }}
                  key={status}
                >
                  {status}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(groupedTickets).map((ticketGroup, index) => (
              <tr key={index}>
                <td className="text-center" style={{color:'#42526e'}}>{index + 1}</td>
                <td className="text-center text-capitalize" style={{color:'#42526e'}}>
                  {ticketGroup.openedBy?.toLowerCase()}
                </td>
                {/* Render the count for each status in the appropriate column */}
                {allStatuses.map((status) => (
                  <td
                    className="text-center"
                    style={{ cursor: "pointer",color:'#42526e' }}
                    key={status}
                    onClick={() => handleTicket(status, ticketGroup.openedBy)}
                  >
                    {ticketGroup.statuses[status] || 0}{" "}
                    {/* Default to 0 if no tickets for this status */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No tickets found.</p>
      )}
    </div>
  );
}

export default TicketsNowAt;
