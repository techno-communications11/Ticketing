import React, { useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/apiRequest";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setId, fetchIndividualTickets } from "../redux/marketSlice";
import PageCountStack from "../universalComponents/PageCountStack";
import "../styles/loader.css";
import TicketBody from "../universalComponents/TicketBody";
import getDecodedToken from "../universalComponents/decodeToken";
import { useMyContext } from "../universalComponents/MyContext";

function TicketNowAtData() {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const department = getDecodedToken().department;
  let { datafullname, datastatusId } = useMyContext();
  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get("/createTickets/ticketnowatdata", {
        params: { datastatusId, datafullname },
      });
  
      if (response.status === 200) {
        // Add openedByFullName to each ticket in the array
        const ticketsWithFullName = response.data.tickets.map(ticket => ({
          ...ticket,
          openedByFullName: datafullname, // Add openedByFullName to each ticket
        }));
  
        setTickets(ticketsWithFullName); // Set the tickets with added openedByFullName
        setAuthenticated(true);
        console.log(ticketsWithFullName, "Fetched tickets with full name");
      }
  
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const currentItems = tickets
    ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div className="container-fluid mt-1">
      <h1
        className="my-2 d-flex justify-content-center"
        style={{ color: "#E10174", fontSize: "2rem" }}
      >
        Total User Tickets
      </h1>

      {authenticated && (
        <div className="table-responsive " style={{ zIndex: 1 }}>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                {["SC.No", "NTID / Email", "Full Name", "Status", "CreatedAt", "Now At", "CompletedBy", "CompletedAt", "Duration", "Details", department === "SuperAdmin" && "Delete"].map(
                  (header) => (
                    header && (
                      <th
                        key={header}
                        className="text-center"
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        {header}
                      </th>
                    )
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((ticket, index) => (
                  <TicketBody
                    fetchUserTickets={fetchUserTickets}
                    key={ticket.id}
                    ticket={ticket}
                    index={index}
                    handleTicket={handleTicket}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <PageCountStack
        filteredTickets={tickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}

export default TicketNowAtData;