import React from 'react';
import { Form, Col, Row, Dropdown } from 'react-bootstrap';

const statuses = ['New', 'Opened', 'Inprogress', 'Completed', 'ReOpened'];

const Filtering = ({ ntidFilter, setntidFilter, statusFilter, setStatusFilter, dateFilter, setDateFilter }) => {
  return (
    <Form className='col-12'>
      <Row className="g-2">
        <Col xs={12} md={4}>
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
        <Col xs={12} md={4}>
          <Form.Group controlId="statusFilter">
            <Dropdown className="mb-1">
              <Dropdown.Toggle
                className='bg-white fw-medium text-secondary border shadow-none w-100 text-start'
                id="StatusFilterDropdown"
                aria-label="Status Filter"
              >
                {statusFilter || 'Select Status'} 
              </Dropdown.Toggle>

              <Dropdown.Menu className='col-12 col-md-12'>
                {statuses.map((status, index) => (
                  <Dropdown.Item
                    key={index}
                    eventKey={status}
                    className="shadow-lg fw-medium text-primary text-capitalize"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status} 
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>
        </Col>
        <Col xs={12} md={4}>
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
