import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { Pie } from "react-chartjs-2"; // Import the Pie chart component
import { FaArrowRight, FaTicketAlt, FaChartPie, FaSync, FaCheckCircle, FaExclamationCircle, FaUserClock } from "react-icons/fa"; // React Icons
import getDecodedToken from "../universalComponents/decodeToken";
import { apiRequest } from "../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../universalComponents/MyContext";

function DepartmentHome() {
  const department = getDecodedToken()?.department;
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setStatusId, setDepartment } = useMyContext();
  const usersId = getDecodedToken().id;

  useEffect(() => {
    const getStatusOfDepartment = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get(
          `/createTickets/getDepartmentStats/${department}/${usersId}`
        );
        if (response.status === 200) {
          setCounts(
            Object.entries(response.data).map(([key, value]) => ({
              key,
              value,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (department) {
      getStatusOfDepartment();
    }
  }, [department, usersId]);

  // Filter out the "total" entry from the counts array
  const filteredCounts = counts.filter((count) => count.key !== "Total");

  // Prepare data for the pie chart
  const pieData = {
    labels: filteredCounts.map((count) => count.key), // Get the keys as labels
    datasets: [
      {
        data: filteredCounts.map((count) => count.value), // Get the values as data
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ], // Colors for each segment
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  const handleClick = (status) => {
    const statusMap = {
      Total: "0",
      new: "1",
      opened: "2",
      inprogress: "3",
      completed: "4",
      reopened: "5",
    };
    const statusId = statusMap[status] || "0";
    localStorage.setItem("department", department);
    setDepartment(department);
    setStatusId(statusId);
    navigate("/showdeptwiseticks");
  };

  const getDepartmentdata = getDecodedToken().subDepartment;

  return loading ? (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden"></span>
      </Spinner>
    </div>
  ) : (
    <Container fluid>
      {getDepartmentdata === 'Manager' && (
        <div className="mt-3 text-end">
          <p className="fs-5 p-1 text-primary text-decoration-none text-capitalize">
            All tickets in department <a href="/getalldepartmenttickets"><FaArrowRight /></a>
          </p>
        </div>
      )}

      <h2 className="text-center my-4" style={{ color: "#E10174" }}>
        {department} Department Status
      </h2>

      <Row className="justify-content-center p-3">
        <Col md={8} className="d-flex flex-wrap justify-content-center gap-4">
          {counts.map((count, index) => (
            <Card
              key={index}
              style={{ cursor: "pointer", width: "18rem", height: "10rem" }}
              className="shadow-sm hover-shadow-lg transition-all"
              onClick={() => handleClick(count.key)}
            >
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <h3 style={{ color: "#E10174" }}>{count.value}</h3>
                <h4 className="text-center">{count.key}</h4>
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col md={4} className="d-flex align-items-center justify-content-center">
          <Card className="shadow-sm p-3">
            <Card.Body>
              <h5 className="text-center mb-4">
                <FaChartPie className="me-2" /> Status Overview
              </h5>
              <Pie data={pieData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DepartmentHome;