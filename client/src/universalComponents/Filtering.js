import React from 'react';
import { Form, Col, Row } from 'react-bootstrap';


const Filtering = ({  dateFilter, setDateFilter }) => {
  return (
    <Form className='col-12'>
      <Row className="g-2">
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
