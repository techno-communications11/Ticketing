import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { FaArrowRight, FaChartPie } from "react-icons/fa";
import getDecodedToken from "../universalComponents/decodeToken";
import { apiRequest } from "../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../universalComponents/MyContext";
import "../styles/DepartmentHome.css"; // New custom CSS file

function DepartmentHome() {
  const department = getDecodedToken()?.department;
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setStatusId, setDepartment } = useMyContext();
  const usersId = getDecodedToken()?.id;

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

    if (department && usersId) {
      getStatusOfDepartment();
    }
  }, [department, usersId]);

  // Filter out the "Total" entry from the counts array
  const filteredCounts = counts.filter((count) => count.key !== "Total");

  // Prepare data for the pie chart
  const pieData = {
    labels: filteredCounts.map((count) => count.key),
    datasets: [
      {
        data: filteredCounts.map((count) => count.value),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 12 },
          color: "#42526e",
        },
      },
    },
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
    const statusId = statusMap[status.toLowerCase()] || "0";
    localStorage.setItem("department", department);
    setDepartment(department);
    setStatusId(statusId);
    navigate("/showdeptwiseticks");
  };

  const getDepartmentdata = getDecodedToken()?.subDepartment;
  const handleAllTicketsClick = () => navigate("/getalldepartmenttickets");

  return loading ? (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" role="status" variant="pink" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  ) : (
    <Container fluid className="department-home-container">
      {getDepartmentdata === "Manager" && (
        <div className="mt-3 text-end">
          <span
            className="fs-5 text-primary text-decoration-none text-capitalize all-tickets-link"
            onClick={handleAllTicketsClick}
          >
            All tickets in department <FaArrowRight className="ms-1" />
          </span>
        </div>
      )}

      <h2 className="text-center my-4 text-pink fw-bold">
        {department} Department Status
      </h2>

      <Row className="justify-content-center p-3">
        <Col md={8} className="d-flex flex-wrap justify-content-center gap-4">
          {counts.map((count, index) => (
            <Card
              key={index}
              className="status-card shadow-sm"
              style={{ width: "18rem", height: "10rem" }}
              onClick={() => handleClick(count.key)}
            >
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <h3 className="text-pink fw-bold mb-2">{count.value}</h3>
                <h4 className="text-center text-dark text-capitalize">{count.key}</h4>
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col md={4} className="d-flex align-items-center justify-content-center">
          <Card className="pie-card shadow-sm p-3">
            <Card.Body>
              <h5 className="text-center mb-4 text-dark fw-medium">
                <FaChartPie className="me-2 text-pink" /> Status Overview
              </h5>
              <Pie data={pieData} options={pieOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DepartmentHome;