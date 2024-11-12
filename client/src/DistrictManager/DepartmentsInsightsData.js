import React, { useEffect, useState } from "react";
import { useMyContext } from "../universalComponents/MyContext";
import { apiRequest } from "../lib/apiRequest";
import getDecodedToken from "../universalComponents/decodeToken";
import TicketBody from "../universalComponents/TicketBody";
import { IoFilterSharp } from "react-icons/io5";
import { BsCalendar2DateFill } from "react-icons/bs";
import StatusFilter from "../universalComponents/StatusFilter";
import FullNameFilter from "../universalComponents/FullNameFilter";
import NtidFilter from "../universalComponents/NtidFilter";
import CreatedAt from "../universalComponents/CreatedAt";
import CompletedAt from "../universalComponents/CompletedAt";
import PageCountStack from "../universalComponents/PageCountStack";
import '../styles/loader.css'
import { useDispatch } from "react-redux";
import { setId,fetchIndividualTickets } from "../redux/marketSlice";
import FilterLogic from "../universalComponents/FilteringLogic";

function DepartmentsInsightsData() {
  const dispatch=useDispatch();
  let { statusId, dm, fullname } = useMyContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const department = getDecodedToken().department;

  // Pagination and filters state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState("");
  const [fullnameFilter, setFullnameFilter] = useState("");
  const [ntidFilter, setntidFilter] = useState("");
  const [createdAt, setCreatedAt] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);

  const [statusToggle, setStatusToggle] = useState(false);
  const [FullnameFilterToggle, setFullnameFilterToggle] = useState(false);
  const [ntidFilterToggle, setNtidFilterToggle] = useState(false);
  const [createdAtToggle, setCreatedAtToggle] = useState(false);
  const [completedAtToggle, setCompletedAtToggle] = useState(false);
  const currentStatusId = statusId || localStorage.getItem('statusData');
  const currentDm = dm || localStorage.getItem('dm');
  
  const getStatusLabel = (currentStatusId) => {
    switch (currentStatusId) {
      case '0':
        return "Total";
      case '1':
        return "new";
      case '2':
        return "opened";
      case '3':
        return "inprogress";
      case '4':
        return "completed";
      case '5':
        return "reopened";
      default:
        return "Unknown";
    }
  };
  
  const handleTicket = (id) => {
    localStorage.setItem("selectedId", id);
    dispatch(setId(id));
    dispatch(fetchIndividualTickets(id));
  };
  const filteredTickets = FilterLogic(
    data || [],
    ntidFilter || "",
    createdAt || "",
    completedAt || "",
    statusFilter || "",
    fullnameFilter || ""
  );
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest.get(
          "/createTickets/departmentInsights",
          {
            params: { department, statusId: currentStatusId, dm: currentDm, fullname },
          }
        );
        setData(Array.isArray(response.data) ? response.data : response.data.tickets || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError("Failed to fetch department insights. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    if (department && currentStatusId) {
      fetchData();
    }
  }, [department, currentStatusId, currentDm, fullname]); // Added currentStatusId and currentDm
  

  // Filter handling
  const handleStatusFilterClick = () => setStatusToggle(!statusToggle);
  const handleFullnameFilterClick = () => setFullnameFilterToggle(!FullnameFilterToggle);
  const handleNTIDFilterClick = () => setNtidFilterToggle(!ntidFilterToggle);
  const handleCreatedAtFilterClick = () => setCreatedAtToggle(!createdAtToggle);
  const handleCompletedFilterClick = () =>
    setCompletedAtToggle(!completedAtToggle);

  const currentItems = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="loader"></div>;
  if (error) return <p>{error}</p>;

  return (
    <div className="table-responsive container" style={{ zIndex: 1 }}>
      <h3 className="text-center my-2" style={{color:'#E10174'}}>{getStatusLabel(currentStatusId)} Tickets</h3>
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            {[
              "SC.No",
              "NTID",
              "Full Name",
              "Status",
              "CreatedAt",
              "CompletedAt",
              "Duration",
              "Details",
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
                          statusFilter={statusFilter}
                          setStatusToggle={setStatusToggle}
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
                    {FullnameFilterToggle && (
                      <div className="dropdown-menu show">
                        <FullNameFilter
                          fullnameFilter={fullnameFilter}
                          setFullnameFilterToggle={setFullnameFilterToggle}
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
                          ntidFilter={ntidFilter}
                          setntidFilter={setntidFilter}
                          setNtidFilterToggle={setNtidFilterToggle}
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
                          createdAt={createdAt}
                          setCreatedAt={setCreatedAt}
                          setCreatedAtToggle={setCreatedAtToggle}
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
                          completedAt={completedAt}
                          setCompletedAtToggle={setCompletedAtToggle}
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
          {currentItems.map((ticket, index) => (
            <TicketBody
              key={ticket.id}
              ticket={ticket}
              index={index}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              handleTicket={handleTicket}
            />
          ))}
        </tbody>
      </table>
      <PageCountStack
        filteredTickets={filteredTickets}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}

export default DepartmentsInsightsData;
