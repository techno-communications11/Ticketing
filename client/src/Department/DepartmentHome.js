import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Pie } from "react-chartjs-2"; // Import the Pie chart component
import getDecodedToken from "../universalComponents/decodeToken";
import { apiRequest } from "../lib/apiRequest";

function DepartmentHome() {
  const department = getDecodedToken()?.department;
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getStatusOfDepartment = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get(
          `/createTickets/getDepartmentStats/${department}`
        );
        if (response.status === 200) {
          setCounts(Object.entries(response.data).map(([key, value]) => ({ key, value })));
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
  }, [department]);

  // Prepare data for the pie chart
  const pieData = {
    labels: counts.map(count => count.key), // Get the keys as labels
    datasets: [
      {
        data: counts.map(count => count.value), // Get the values as data
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"], // Colors for each segment
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
      }
    ]
  };

  return (
    loading ? (
      <div className="loading"></div>
    ) : (
      <Container>
        <h2 className="mt-4 text-center" style={{color:'#E10174'}}>{department} Department statusData</h2>
        <Row className="d-flex justify-content-center mt-5">
          <Col md={8} className="d-flex flex-wrap justify-content-center gap-3 ">
            {counts.map((count, index) => (
              <Card key={index} className="w-25 h-25">
                <Card.Body className="text-center">
                  <h3 style={{color:'#E10174'}}>{count.value}</h3>
                  <h4>{count.key}</h4>
                </Card.Body>
              </Card>
            ))}
          </Col>
          <Col md={4} className="d-flex align-items-center justify-content-center ">
            <Pie data={pieData} /> {/* Pie chart component */}
          </Col>
        </Row>
      </Container>
    )
  );
}

export default DepartmentHome;
