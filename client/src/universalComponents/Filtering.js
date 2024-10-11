import React from 'react';
import { Form, Col, Row } from 'react-bootstrap';

const Filtering = ({ ntidFilter, setntidFilter, statusFilter, setStatusFilter, dateFilter, setDateFilter }) => {
  return (
    <Form >
      <Row>
        <Col md={4}>
          <Form.Group controlId="ntidFilter">
            <Form.Control 
              type="text" 
              placeholder="Enter NTID" 
              value={ntidFilter} 
              onChange={(e) => setntidFilter(e.target.value)} 
              className="shadow-sm"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="statusFilter">
            <Form.Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="shadow-sm"
            >
              <option value="">Select Status</option>
              <option value="opened">Opened</option>
              <option value="completed">Completed</option>
              <option value="inprogress">In Progress</option>
              <option value="new">New</option>
              <option value="reopened">Reopened</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="dateFilter">
            <Form.Control 
              type="date" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)} 
              className="shadow-sm"
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default Filtering;
