import React, { useState, useEffect, useCallback } from "react";
import { MdDownload, MdFilterList } from "react-icons/md";
import * as XLSX from "xlsx";
import { Table, Row, Col } from "react-bootstrap";
import { apiRequest } from "../lib/apiRequest";
import PageCountStack from "../universalComponents/PageCountStack";
import { Container } from "react-bootstrap";
import DepartmentSelectDropdown from '../universalComponents/DepartmentSelectDropdown'

const DepartmentWise = () => {
  const [ticketCounts, setTicketCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; 

  const safeNumber = (value) => (isNaN(value) ? 0 : value);

  const fetchAllTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest.get("/createTickets/alldeptcounts");
      const ticketData = response.data;
      if (typeof ticketData !== "object" || !Object.keys(ticketData).length) {
        throw new Error("No ticket data received.");
      }

      const counts = Object.keys(ticketData).reduce((acc, department) => {
        const {
          total = 0,
          new: newTickets = 0,
          opened = 0,
          inProgress = 0,
          completed = 0,
          reopened = 0,
        } = ticketData[department];
        acc[department] = {
          total,
          new: newTickets,
          opened,
          inProgress,
          completed,
          reopened,
        };
        return acc;
      }, {});

      setTicketCounts(counts);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.message || "Failed to load ticket data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTickets();
  }, [fetchAllTickets]);

  const downloadStatus = () => {
    const dataArray = Object.entries(ticketCounts).map(
      ([department, counts]) => ({
        Department: department,
        Total: safeNumber(counts.total),
        New: safeNumber(counts.new),
        Opened: safeNumber(counts.opened),
        InProgress: safeNumber(counts.inProgress),
        Completed: safeNumber(counts.completed),
        Reopened: safeNumber(counts.reopened),
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, "department_ticket_counts.xlsx");
  };

  const filteredTicketCounts = Object.entries(ticketCounts).filter(
    ([department]) =>
      selectedDepartments.length === 0 ||
      selectedDepartments.includes(department)
  );

  const currentItems = filteredTicketCounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // const handleDepartmentChange = (e) => {
  //   const { options } = e.target;
  //   const selectedOptions = [];
  //   for (let i = 0; i < options.length; i++) {
  //     if (options[i].selected) {
  //       selectedOptions.push(options[i].value);
  //     }
  //   }
  //   setSelectedDepartments(selectedOptions);
  // };

  // const handleSelectAll = (e) => {
  //   if (e.target.checked) {
  //     setSelectedDepartments(Object.keys(ticketCounts));
  //   } else {
  //     setSelectedDepartments([]);
  //   }
  // };

  return (
    <Container>
      <Row>
        {loading ? (
          <div className="loader"></div>
        ) : (
          <div>
            {error && <div className="alert alert-danger">{error}</div>}
            <Col md={12}>
              <h4
                className="d-flex justify-content-center font-family fw-medium"
                style={{ color: "#E10174" }}
              >
                Department Wise Ticket Counts
              </h4>
              <Row className=" d-flex justify-content-center">
                <Col md={12} className="d-flex flex-wrap justify-content-start">
                  <div className="d-flex flex-wrap w-100 gap-2">
                    <button
                      className="btn btn-outline-success fw-medium"
                      onClick={downloadStatus}
                    >
                      <MdDownload /> Download Status Count as Excel File
                    </button>
                  </div>
                </Col>
              </Row>

              <div className="table-responsive-sm ">
                <Table
                  striped
                  bordered
                  hover
                  className="table align-middle text-center"
                >
                  <thead>
                    <tr>
                      <th
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        SINO
                      </th>
                      <th
                        className="text-decoration-none fw-medium"
                        style={{ backgroundColor: "#E10174", color: "white" }}
                      >
                        Departments
                        <MdFilterList
                          className="ms-2"
                          onClick={() => setIsFilterVisible(!isFilterVisible)}
                          style={{ cursor: "pointer" }}
                        />
                        {isFilterVisible && (
                          <>
                            <DepartmentSelectDropdown
                              isFilterVisible={isFilterVisible}
                              setIsFilterVisible={setIsFilterVisible}
                              selectedDepartments={selectedDepartments}
                              setSelectedDepartments={setSelectedDepartments}
                              setCurrentPage={setCurrentPage}
                            />
                          </>
                        )}
                      </th>
                      {[
                        "Total",
                        "New",
                        "Opened",
                        "In Progress",
                        "Completed",
                        "Reopened",
                      ].map((status, index) => (
                        <th
                          key={index}
                          className="text-decoration-none fw-medium"
                          style={{ backgroundColor: "#E10174", color: "white" }}
                        >
                          {status}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(([department, counts], index) => (
                      <tr key={department}>
                        <td>{index + 1}</td>
                        <td>{department}</td>
                        <td>{safeNumber(counts.total)}</td>
                        <td>{safeNumber(counts.new)}</td>
                        <td>{safeNumber(counts.opened)}</td>
                        <td>{safeNumber(counts.inProgress)}</td>
                        <td>{safeNumber(counts.completed)}</td>
                        <td>{safeNumber(counts.reopened)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>
            <PageCountStack
              filteredTickets={filteredTicketCounts}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </Row>
    </Container>
  );
};

export default DepartmentWise;
