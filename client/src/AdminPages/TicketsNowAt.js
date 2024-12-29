import React, {  useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import '../styles/loader.css'
import { useNavigate } from 'react-router-dom';
import { useMyContext } from '../universalComponents/MyContext';
function TicketsNowAt() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const navigate=useNavigate();
 const {setDataStatusId,setDataFullName}=useMyContext();
  // Fetch tickets when component mounts
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await apiRequest.get("/createTickets/ticketsnowat"); 
        console.log(response.data, 'Fetched tickets');
        setTickets(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching tickets.");
        setLoading(false);
      }
    };

    fetchTickets();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  if (loading) return <div className='loader'></div>;
  if (error) return <p>{error}</p>;

  // Group tickets by openedBy and count statuses
  const groupedTickets = tickets.reduce((acc, ticket) => {
    const { openedBy, status } = ticket;

    // If the openedBy is not in the accumulator, add them
    if (!acc[openedBy]) {
      acc[openedBy] = {
        openedBy,
        statuses: {}
      };
    }

    // Count the status
    const statusName = status?.name || 'Unknown';
    if (!acc[openedBy].statuses[statusName]) {
      acc[openedBy].statuses[statusName] = 0;
    }
    acc[openedBy].statuses[statusName] += 1;

    return acc;
  }, {});

  // Get all unique status names for the table header
  const allStatuses = [...new Set(tickets.map(ticket => ticket.status?.name))];
  const handleTicket = (status, username) => {
    console.log(status, username, 'jkp');
  
    // Map status to statusId
    const statusMap = {
    
      inprogress: '3',
      completed: '4',
      opened: '2',
      reopened: '5',
    };
  
    const statusId = statusMap[status] || ''; // Default to an empty string if status is not in the map
  
    setDataStatusId(statusId); // Update the state with the calculated statusId
    setDataFullName(username); // Update the state with the username
  
    // Navigate with the updated data
    navigate('/ticketnowatdata');
  };
  

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4" style={{color:'#E10174'}}>Tickets Now_At</h2>
      {Object.keys(groupedTickets).length > 0 ? (
        <table  className="table table-bordered table-striped table-responsive table-sm">
          <thead className="thead-dark">
            <tr>
            <th className="text-center" style={{backgroundColor:'#E10174' ,color:'white'}}>SCNO</th>
              <th className="text-center" style={{backgroundColor:'#E10174' ,color:'white'}}  >Opened By</th>
              {/* Create a column for each status */}
              {allStatuses.map((status) => (
                <th className="text-center" style={{backgroundColor:'#E10174' ,color:'white'}} key={status}>{status}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(groupedTickets).map((ticketGroup,index) => (
              <tr key={index}>
                <td className="text-center">{index+1}</td>
                <td className="text-center text-capitalize">{ticketGroup.openedBy?.toLowerCase()}</td>
                {/* Render the count for each status in the appropriate column */}
                {allStatuses.map((status) => (
                  <td className="text-center" style={{cursor:'pointer'}} key={status} onClick={()=>handleTicket(status,ticketGroup.openedBy)}>
                    {ticketGroup.statuses[status] || 0} {/* Default to 0 if no tickets for this status */}
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
