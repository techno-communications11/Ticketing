import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/apiRequest";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setId, fetchIndividualTickets } from "../redux/marketSlice";
import PageCountStack from "../universalComponents/PageCountStack";
import "../styles/loader.css";
import TicketBody from "../universalComponents/TicketBody";
import FilterLogic from "../universalComponents/FilteringLogic";
import { useMyContext } from "../universalComponents/MyContext";
import StatusFilter from "../universalComponents/StatusFilter";
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import FullnameFilter from "../universalComponents/FullNameFilter";
import getDecodedToken from "../universalComponents/decodeToken";

function TotalUserTickets() {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ntidFilter, setntidFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const itemsPerPage = 30;
  let { adminntid, statusId } = useMyContext();
  // var ntid = adminntid;

  // statusId = statusId === "" ? statusId='0' : localStorage.getItem("statusId");
  const [statusToggle, setStatusToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const [fullnameToggle, setFullnameToggle] = useState(false);

  const handleFullnameFilterClick = () => {
    setFullnameToggle(!fullnameToggle);
    setStatusToggle(false);
    setNtidFilterToggle(false);
    setCreatedAtToggle(false);
    setCompletedAtToggle(false);
  };

  const handleStatusFilterClick = () => {
    setStatusToggle(!statusToggle);
    setNtidFilterToggle(false);
    setCreatedAtToggle(false);
    setCompletedAtToggle(false);
  };

  const handleNTIDFilterClick = () => {
    setNtidFilterToggle(!ntidFilterToggle);
    setStatusToggle(false);
    setCreatedAtToggle(false);
    setCompletedAtToggle(false);
  };

  const handleCreatedAtFilterClick = () => {
    setCreatedAtToggle(!createdAtToggle);
    setStatusToggle(false);
    setNtidFilterToggle(false);
    setCompletedAtToggle(false);
  };

  const handleCompletedFilterClick = () => {
    setCompletedAtToggle(!completedAtToggle);
    setStatusToggle(false);
    setNtidFilterToggle(false);
    setCreatedAtToggle(false);
  };

  
    const fetchUserTickets = async () => {
      setLoading(true);
      const params = new URLSearchParams(); // Create a new URLSearchParams object
      let url = `/createTickets/usertickets`; // Base URL

      try {
        console.log(adminntid,"assdsss")
        if (adminntid) {
          params.append("ntid", adminntid); // Append ntid if it has a value
        }

        if (adminntid === null && statusId) {
          params.append("statusId", statusId); // Append only statusId if adminntid is null
        }

        if (statusId && adminntid !== null) {
          params.append("statusId", statusId); // Append statusId if both have values
        }

        if (params.toString()) {
          // Only append params if there are any
          url += `?${params.toString()}`;
        }

        // Output the final URL for verification

        const response = await apiRequest.get(url);
        if (response.status === 200) {
          setTickets(response.data);
          setAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        toast.error("Failed to fetch tickets");
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    // Only call fetchUserTickets if adminntid is not null
    fetchUserTickets();
  }, [statusId, adminntid]);

  const filteredTickets = FilterLogic(
    tickets || [],
    ntidFilter || "",
    createdAt || "",
    completedAt || "",
    statusFilter || "",
    fullnameFilter || ""
  );
const department=getDecodedToken().department;
 
    

    

  const currentItems = filteredTickets
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle ticket click
  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };

  // Render loading spinner
  if (loading) return <div className="loader"></div>;

  return (
    <div className="container-fluid mt-1">
      <h1
        className="my-2 d-flex justify-content-center"
        style={{ color: "#E10174",fontSize:'2rem' }}
      >
        Total User Tickets
      </h1>

      {authenticated &&  (
        <div className="table-responsive " style={{ zIndex: 1 }}>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                {[
                  "SC.No",
                  "Email / NTID",
                  "Full Name",
                  "Status",
                  "CreatedAt",
                  ...(department === "SuperAdmin"
                    ? ["Now At", "CompletedBy"]
                    : []),
                  "CompletedAt",
                  "Duration",
                  "Details",
                  department === "SuperAdmin"&&"Delete" 
                ].map((header) => (
                  <th
                    key={header}
                    className="text-center"
                    style={{ backgroundColor: "#E10174", color: "white" }}
                  >
                    {header}
                    {header === "Status" && (
                      <>
                        <IoFilterSharp
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleStatusFilterClick}
                        />
                        {statusToggle && (
                          <div className="dropdown-menu show">
                            <StatusFilter
                              setStatusToggle={setStatusToggle}
                              statusFilter={statusFilter}
                              setStatusFilter={setStatusFilter}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {header === "Full Name" && (
                      <>
                        <IoFilterSharp
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleFullnameFilterClick}
                        />
                        {fullnameToggle && (
                          <div className="dropdown-menu show">
                            <FullnameFilter
                              setFullnameFilterToggle={setFullnameToggle}
                              fullnameFilter={fullnameFilter}
                              setFullnameFilter={setFullnameFilter}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {header === "NTID" && (
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
                              setntidFilter={setntidFilter}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {header === "CreatedAt" && (
                      <>
                        <BsCalendar2DateFill
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleCreatedAtFilterClick}
                        />
                        {createdAtToggle && (
                          <div className="dropdown-menu show">
                            <CreatedAt
                              setCreatedAtToggle={setCreatedAtToggle}
                              createdAt={createdAt}
                              setCreatedAt={setCreatedAt}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {header === "CompletedAt" && (
                      <>
                        <BsCalendar2DateFill
                          style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                          onClick={handleCompletedFilterClick}
                        />
                        {completedAtToggle && (
                          <div className="dropdown-menu show">
                            <CompletedAt
                              setCompletedAtToggle={setCompletedAtToggle}
                              completedAt={completedAt}
                              setCompletedAt={setCompletedAt}
                              setCurrentPage={setCurrentPage}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ?currentItems.map((ticket, index) => (
                <TicketBody
                fetchUserTickets={fetchUserTickets} 
                  key={ticket.id}
                  ticket={ticket}
                  index={index}
                  handleTicket={handleTicket}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              )):( <tr>
                {/* Set the colspan to match the number of columns in your table */}
                <td colSpan="8" className="text-center">
                  No tickets found
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
      )}
      <PageCountStack
        filteredTickets={filteredTickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}

export default TotalUserTickets;
