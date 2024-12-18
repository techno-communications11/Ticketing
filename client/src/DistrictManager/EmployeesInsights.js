import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { apiRequest } from "../lib/apiRequest";
import { MdFilterList } from "react-icons/md"; // Import the filter icon
import Form from "react-bootstrap/Form"; // Import Form component from react-bootstrap
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is included
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../universalComponents/MyContext";
import { setUserAndStatus, fetchStatusTickets } from "../redux/userStatusSlice";

const EmployeesInsights = ({ dm }) => {
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false); // State to toggle filter input
  const token = localStorage.getItem("token");
  const fullname = dm ? dm : jwtDecode(token).fullname;
  const { setNtid } = useMyContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest.get(
          `/createTickets/fetchuserticketsstats?fullname=${fullname}`
        );
        setTicketData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket data", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [fullname]);

  // Filtering logic
  const filteredData = ticketData.filter((user) =>
    user.ntid.toLowerCase()?.includes(filter.toLowerCase())
  );
  const handleDataSend = (AdminsDatantid,statusId) => {
    console.log(AdminsDatantid,"ntidppp",statusId,"stausIdpp")
    localStorage.setItem("statusData", statusId);
    dispatch(fetchStatusTickets({ ntid:AdminsDatantid,statusId}));
    dispatch(setUserAndStatus({  ntid:AdminsDatantid,statusId }));
    navigate("/usertickets");
  };

  const handleStatusClick = (AdminsDatantid, statusId) => () =>{
    console.log(AdminsDatantid,'ntidzz',statusId,"sttausIdzzz")
    handleDataSend( AdminsDatantid,statusId);
}
  const handleTotalTickets = (AdminsDatantid) => () => {
    console.log(AdminsDatantid, "AdminsDatantid");
    setNtid(AdminsDatantid);
    if (AdminsDatantid) {
      navigate("/totalusertickets");
    } else {
      console.error("NTID is not available");
    }
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="container mt-2">
      <h3 className="text-center mb-4" style={{ color: "#E10174" }}>
        Total Employees Insights
      </h3>

      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover">
          <thead>
            <tr>
              <th
                style={{ backgroundColor: "#E10174", color: "white" }}
                className="text-center"
              >
                SINO
              </th>
              <th
                style={{
                  backgroundColor: "#E10174",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Email
                <MdFilterList
                  className="ms-2"
                  onClick={() => setIsFilterVisible(!isFilterVisible)}
                  style={{ cursor: "pointer" }}
                />
                {isFilterVisible && (
                  <Form.Control
                    type="text"
                    placeholder="Filter by NTID"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="mt-1"
                    style={{ width: "auto", display: "inline-block" }} // Inline display
                  />
                )}
              </th>
              <th style={{ backgroundColor: "#E10174", color: "white" }}>
                Total Tickets
              </th>
              <th style={{ backgroundColor: "#E10174", color: "white" }}>
                New
              </th>
              <th style={{ backgroundColor: "#E10174", color: "white" }}>
                Opened
              </th>
              <th style={{ backgroundColor: "#E10174", color: "white" }}>
                In Progress
              </th>
              <th style={{ backgroundColor: "#E10174", color: "white" }}>
                Closed
              </th>
              <th style={{ backgroundColor: "#E10174", color: "white" }}>
                Reopened
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user, index) => (
              <tr key={user.ntid}>
                <td className="text-center ">{index + 1}</td>
                <td
                  className="text-center"
                  style={{ cursor: "pointer" }}
                  onClick={handleTotalTickets(user.ntid)}
                >
                  {user.ntid}
                </td>
                <td
                  className="text-center"
                  style={{ cursor: "pointer" }}
                  onClick={handleTotalTickets(user.ntid)}
                >
                  {user.totalTickets}
                </td>
                <td
                  className="text-center"
                  // style={{ cursor: "pointer" }}
                  // onClick={handleStatusClick(user.ntid, "1")}
                >
                  {user.newTickets}
                </td>
                <td
                  className="text-center"
                  // style={{ cursor: "pointer" }}
                  // onClick={handleStatusClick(user.ntid, "2")}
                >
                  {user.openedTickets}
                </td>
                <td
                  className="text-center"
                  // style={{ cursor: "pointer" }}
                  // onClick={handleStatusClick(user.ntid, "3")}
                >
                  {user.inprogressTickets}
                </td>
                <td
                  className="text-center"
                  // style={{ cursor: "pointer" }}
                  // onClick={handleStatusClick(user.ntid, "4")}
                >
                  {user.completedTickets}
                </td>
                <td
                  className="text-center"
                  // style={{ cursor: "pointer" }}
                  // onClick={handleStatusClick(user.ntid, "5")}
                >
                  {user.reopenedTickets}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesInsights;
