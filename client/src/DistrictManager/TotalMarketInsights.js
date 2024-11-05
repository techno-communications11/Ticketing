import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import getDecodedToken from '../universalComponents/decodeToken';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Container, Row, Col } from 'react-bootstrap';
import { useMyContext } from '../universalComponents/MyContext';
import { useNavigate } from 'react-router-dom';
// Register necessary Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

function TotalMarketInsights({dm}) {
    const fullname = dm?dm:getDecodedToken()?.fullname;
    const [storeInsights, setStoreInsights] = useState({});
    const navigate=useNavigate()
    const {setStatusId,setDm}=useMyContext()

    useEffect(() => {
        const getMarketInsights = async () => {
            try {
                const response = await apiRequest.get('/createTickets/getmarketinsights', {
                    params: { fullname }
                });
                console.log(response.data);
                if (response.status === 200) {
                    setStoreInsights(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        };
        getMarketInsights();
    }, [fullname]);  // Add fullname as a dependency


    const filteredInsights = Object.entries(storeInsights)
    .filter(([key]) => key !== "Total");
    const pieChartData = {
        labels: filteredInsights.map(([key]) => key),  // The status labels (excluding "Total")
        datasets: [
            {
                data: filteredInsights.map(([, value]) => value),  // The counts for each status
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                ],
                hoverBackgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                ]
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
        localStorage.setItem('statusData',status)
        localStorage.setItem('dm',fullname)
        setStatusId(status)
        setDm(fullname)
        navigate('/distinsights')
        
        
      }

    return (
        <Container className="d-flex flex-wrap">
            <Row className="w-100">
                {/* Left Side - Market Insights */}
                <Col xs={12} md={6} className="p-3">
                    <h3 className='text-center' style={{ color: '#E10174' }}>Total Market Insights</h3>

                    {/* List of status counts */}
                    <ul className='d-flex flex-wrap justify-content-center p-auto'>
                        {Object.keys(storeInsights).map(status => (
                            <li
                            onClick={()=>handleClick(status)}
                                className='card card-body p-auto m-1 text-capitalize d-flex flex-column align-items-center'
                                key={status}
                                style={{ minWidth: '150px', maxWidth: '200px', flex: '1 1 45%',cursor:'pointer' }}  // Adjusts card size for responsiveness
                            >
                                <span className='fs-5'>{status}</span>
                                <span style={{ color: '#E10174' }} className='fs-3'>{storeInsights[status]}</span>
                            </li>
                        ))}
                    </ul>
                </Col>

                {/* Right Side - Pie Chart */}
                <Col xs={12} md={6} className="p-3" style={{ height: '60vh' }}>
                    <Pie data={pieChartData} />
                </Col>
            </Row>
        </Container>
    );
}

export default TotalMarketInsights;
