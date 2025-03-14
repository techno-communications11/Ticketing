import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import EmployeesInsights from "./EmployeesInsights";
import TotalMarketInsights from "./TotalMarketInsights";
import { useMyContext } from "../universalComponents/MyContext";
import "../styles/DMTabs.css"; // New custom CSS file

function DMTabs(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className="dm-tab-panel"
    >
      {value === index && (
        <Box sx={{ p: 3 }} className="dm-tab-content">
          {children}
        </Box>
      )}
    </div>
  );
}

DMTabs.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);
  const { dm } = useMyContext();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }} className="dm-tabs-container container-fluid">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }} className="dm-tabs-header">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="District Manager Insights Tabs"
          className="dm-tabs"
          TabIndicatorProps={{
            style: {
              backgroundColor: "#E10174", // Pink indicator
            },
          }}
        >
          <Tab
            label="Market Insights"
            {...a11yProps(0)}
            className="dm-tab"
          />
          <Tab
            label="Employees Insights"
            {...a11yProps(1)}
            className="dm-tab"
          />
        </Tabs>
      </Box>
      <DMTabs value={value} index={0}>
        <TotalMarketInsights dm={dm} />
      </DMTabs>
      <DMTabs value={value} index={1}>
        <EmployeesInsights dm={dm} />
      </DMTabs>
    </Box>
  );
}