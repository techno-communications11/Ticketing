import React, { useEffect, useState } from "react";
import { Container, Table, Row, Col } from "react-bootstrap";
import { apiRequest } from "../lib/apiRequest";
import { useDispatch } from "react-redux";
import { setId, fetchIndividualTickets } from "../redux/marketSlice";
import PageCountStack from "../universalComponents/PageCountStack";
import TicketBody from "../universalComponents/TicketBody";
import getDecodedToken from "../universalComponents/decodeToken";
import { useMyContext } from "../universalComponents/MyContext";
import { FaExclamationCircle } from "react-icons/fa";
import "../styles/TicketNowAtData.css"; // New CSS file for this component

function TicketNowAtData() {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const department = getDecodedToken().department;
  const { datafullname, datastatusId, Dates } = useMyContext();

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get("/createTickets/ticketnowatdata", {
        params: { datastatusId, datafullname },
      });

      if (response.status === 200) {
        const ticketsWithFullName = response.data.tickets.map((ticket) => ({
          ...ticket,
          openedByFullName: datafullname,
        }));

        const filteredTickets = ticketsWithFullName.filter((ticket) => {
          const matchesFullName = ticket.openedByFullName === datafullname;
          const { startDate, endDate } = Dates || {};

          if (startDate && endDate) {
            const ticketDate = new Date(ticket.createdAt);
            const isWithinDateRange =
              ticketDate >= new Date(startDate) && ticketDate <= new Date(endDate);
            return matchesFullName && isWithinDateRange;
          }
          return matchesFullName;
        });

        setTickets(filteredTickets);
        setAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [datafullname, datastatusId, Dates]);

  const currentItems = tickets
    ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  return (
    <Container fluid className="mt-4">
      {/* Header Section */}
      {currentItems.length > 0 && (
        <Row className="mb-3">
          <Col>
            <h1 className="fw-bold text-dark text-center">
              Total User Tickets <span style={{ color: "#E10174" }}>{datafullname || ""}</span>
            </h1>
          </Col>
        </Row>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="spinner-border text-pink" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Table Section */}
          {authenticated && currentItems.length > 0 ? (
            <div className="table-responsive shadow-sm rounded">
              <Table hover className="table-modern">
                <thead>
                  <tr style={{ backgroundColor: "#E10174", color: "white" }}>
                    {[
                      "SC.No",
                      "NTID / Email",
                      "Full Name",
                      "Status",
                      "CreatedAt",
                      "Now At",
                      "CompletedBy",
                      "CompletedAt",
                      "Duration",
                      "Details",
                      department === "SuperAdmin" && "Delete",
                    ].map(
                      (header) =>
                        header && (
                          <th key={header} className="text-center align-middle fw-medium">
                            {header}
                          </th>
                        )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((ticket, index) => (
                    <TicketBody
                      fetchUserTickets={fetchUserTickets}
                      key={ticket.id}
                      ticket={ticket}
                      index={index}
                      handleTicket={handleTicket}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                    />
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
              <div className="text-center">
                <FaExclamationCircle className=" mb-3" style={{ fontSize: "5rem" ,color:'#E10174'}} />
                <h5 className="fw-bold text-muted">No Data Available</h5>
                <p className="text-muted">Please check back later or try refreshing the page.</p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {currentItems.length > 0 && (
            <div className="mt-4">
              <PageCountStack
                filteredTickets={tickets}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default TicketNowAtData;