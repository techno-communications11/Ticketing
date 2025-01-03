import React, { useState, useEffect,useCallback } from "react";
import { Row, Col } from "react-bootstrap";

function DateRangeFilter({ sendDatesToParent }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (startDate && endDate) {
      sendDatesToParent(startDate, endDate); // Send both start and end dates to the parent
    }
  }, [startDate, endDate, sendDatesToParent]); // Runs when either startDate or endDate changes

  const handleStartDate = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDate = (e) => {
    setEndDate(e.target.value);
  };

  return (
    <Row>
      <Col className="d-flex align-items-center">
        <label style={{ width: '8rem' }}>Start Date:</label>
        <input type="date" className="form-control" onChange={handleStartDate} />
      </Col>
      <Col className="d-flex align-items-center mt-2 mt-md-0">
        <label style={{ width: '8rem' }}>End Date:</label>
        <input type="date" className="form-control" onChange={handleEndDate} />
      </Col>
    </Row>
  );
}

export default DateRangeFilter;
