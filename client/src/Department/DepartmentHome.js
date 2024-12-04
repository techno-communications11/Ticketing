import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Pie } from "react-chartjs-2"; // Import the Pie chart component
import getDecodedToken from "../universalComponents/decodeToken";
import { apiRequest } from "../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../universalComponents/MyContext";

function DepartmentHome() {
  const department = getDecodedToken()?.department;
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();
  const {setStatusId,setDepartment}=useMyContext()
  

  useEffect(() => {
    const getStatusOfDepartment = async () => {
      console.log(department,"ppppppppp")
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
    console.log(counts,'counntsss')

    if (department) {
      getStatusOfDepartment();
    }
  }, [department]);

  // Filter out the "total" entry from the counts array
const filteredCounts = counts.filter(count => count.key !== "Total");

// Prepare data for the pie chart
const pieData = {
  labels: filteredCounts.map(count => count.key), // Get the keys as labels
  datasets: [
    {
      data: filteredCounts.map(count => count.value), // Get the values as data
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"], // Colors for each segment
      hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
    }
  ]
};
const handleClick=(status)=>{
  if(status==='Total'){
    status='0';
  }
  if(status==='new'){
    status='1'
  }
  if(status==='opened'){
    status='2'
  }
  if(status==='inprogress'){
    status='3'
  }
  if(status==='completed'){
    status='4'
  }
  if(status==='reopened'){
    status='5'
  }
  localStorage.setItem("department", department);
    console.log(department,status,'deeee')
    setDepartment(department);
    setStatusId(status);
    navigate('/showdeptwiseticks');
  
  
}


  return (
    loading ? (
      <div className="loading"></div>
    ) : (
      <Container>
        <h2 className="mt-4 text-center" style={{color:'#E10174'}}>{department} Department statusData</h2>
        <Row className="d-flex justify-content-center mt-5">
          <Col md={8} className="d-flex flex-wrap justify-content-center gap-3 ">
            {counts.map((count, index) => (
              <Card key={index} className="w-25 h-25" style={{cursor:'pointer'}}onClick={()=>handleClick(count.key)}>
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
