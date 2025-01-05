import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/apiRequest';
import getDecodedToken from '../universalComponents/decodeToken';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Container, Row, Col } from 'react-bootstrap';
import { useMyContext } from '../universalComponents/MyContext';
import { useNavigate } from 'react-router-dom';
import animationData from "../universalComponents/Animation.json";
import { Player } from "@lottiefiles/react-lottie-player";

Chart.register(ArcElement, Tooltip, Legend);

function TotalMarketInsights({ dm }) {
    const fullname = dm ? dm : getDecodedToken()?.fullname;
    const [storeInsights, setStoreInsights] = useState({});
    const navigate = useNavigate();
    const { setStatusId, setDm } = useMyContext();

    useEffect(() => {
        const getMarketInsights = async () => {
            try {
                const response = await apiRequest.get('/createTickets/getmarketinsights', {
                    params: { fullname }
                });
                if (response.status === 200) {
                    setStoreInsights(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        };
        getMarketInsights();
    }, [fullname]);

    const filteredInsights = Object.entries(storeInsights).filter(([key]) => key !== "Total");

    const pieChartData = {
        labels: filteredInsights.map(([key]) => key),
        datasets: [
            {
                data: filteredInsights.map(([, value]) => value),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
        ]
    };

    const handleClick = (status) => {
        const statusMap = {
            Total: '0',
            new: '1',
            opened: '2',
            inprogress: '3',
            completed: '4',
            reopened: '5'
        };

        const mappedStatus = statusMap[status] || status;
        localStorage.setItem('statusData', mappedStatus);
        localStorage.setItem('dm', fullname);
        setStatusId(mappedStatus);
        setDm(fullname);
        navigate('/distinsights');
    };

    return (
        <Container className="d-flex flex-wrap">
            {Object.keys(storeInsights).length > 0 ? (
                <Row className="w-100">
                    <Col xs={12} md={6} className="p-3">
                        <h3 className='text-center' style={{ color: '#E10174' }}>Total Market Insights</h3>
                        <ul className='d-flex flex-wrap justify-content-center p-auto'>
                            {Object.keys(storeInsights).map(status => (
                                <li
                                    onClick={() => handleClick(status)}
                                    className='card card-body p-auto m-1 text-capitalize d-flex flex-column align-items-center'
                                    key={status}
                                    style={{ minWidth: '150px', maxWidth: '200px', flex: '1 1 45%', cursor: 'pointer' }}
                                >
                                    <span className='fs-5'>{status}</span>
                                    <span style={{ color: '#E10174' }} className='fs-3'>{storeInsights[status]}</span>
                                </li>
                            ))}
                        </ul>
                    </Col>
                    <Col xs={12} md={6} className="p-3" style={{ height: '60vh' }}>
                        <Pie data={pieChartData} />
                    </Col>
                </Row>
            ) : (
                <Player
                    autoplay
                    loop
                    src={animationData}
                    style={{ height: "700px", width: "700px", marginLeft: '50%' }}
                />
            )}
        </Container>
    );
}

export default TotalMarketInsights;
