import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import EmployeesInsights from './EmployeesInsights';
import TotalMarketInsights from './TotalMarketInsights';

function DMTabs(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = ( event,newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }} className="container fw-medium">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }} >
        <Tabs value={value} onChange={handleChange}   aria-label="basic tabs example" >
          <Tab className='fw-bolder' label="Market Insights" {...a11yProps(0)} />
          <Tab className='fw-bolder' label="Employees Insights" {...a11yProps(1)} />
          
        </Tabs>
      </Box>
      <DMTabs value={value} index={0}>
      <TotalMarketInsights/>
      </DMTabs>
      <DMTabs value={value} index={1}>
      <EmployeesInsights/>
      </DMTabs>
     
    </Box>
  );
}
