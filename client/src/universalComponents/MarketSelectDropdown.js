import {  useRef } from "react";
import Form from "react-bootstrap/Form";
import { useOutsideClick } from "./useOutsideClick"; // Custom hook to close dropdown when clicking outside

function MarketSelectDropdown({ marketData ,isFilterVisible,setIsFilterVisible,selectedMarkets,setSelectedMarkets,setCurrentPage}) {
  
  const dropdownRef = useRef(null);
 console.log(marketData,'md')
  // Custom hook to close dropdown on outside click
  useOutsideClick(dropdownRef, () => setIsFilterVisible(false));

  const handleMarketChange = (event) => {
    const value = event.target.value;
    if (selectedMarkets.includes(value)) {
      setSelectedMarkets(selectedMarkets.filter((market) => market !== value));
      setCurrentPage(1)
    } else {
      setSelectedMarkets([...selectedMarkets, value]);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedMarkets(marketData.map((market) => market.market));
      setCurrentPage(1)
    } else {
      setSelectedMarkets([]);
    }
  };

  const isAllSelected = selectedMarkets.length === marketData.length;

  return (
    <div className="position-relative" ref={dropdownRef}>
      {isFilterVisible && (
        <div
          className="dropdown-menu p-3 shadow "
          style={{
            display: "block",
            width: "15rem",
            maxHeight: "20rem",
            overflowY: "auto",
            borderRadius: "5px",
          }}
        >
          <Form.Check
            type="checkbox"
            label="Select All"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="mb-2 fw-medium text-primary "
          />
          {marketData.map((market) => (
            <Form.Check
              type="checkbox"
              key={market.market}
              label={market.market}
              value={market.market}
              checked={selectedMarkets.includes(market.market)}
              onChange={handleMarketChange}
              className="mb-1 fw-medium text-primary text-capitalize fw-mediumer shadow-lg dropdown-item"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MarketSelectDropdown;
