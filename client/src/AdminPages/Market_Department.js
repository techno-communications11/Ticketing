import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import MarketWise from './MarketWise';
import DepartmentWise from './DepartmentWise';
import DM_insights from './DM_insights';
import User_Insights from './User_Insights';
import TicketsNowAt from './TicketsNowAt';

// Custom styled TabPanel component
const TabPanel = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#fff',
  minHeight: 'calc(100vh - 64px)', // Full height minus tabs height
  overflowY: 'auto', // Allow scrolling within the panel if content overflows
}));

function Market_Department(props) {
  const { children, value, index, ...other } = props;

  return (
    <TabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </TabPanel>
  );
}

Market_Department.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// Accessibility props for tabs
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Custom styled Tabs and Tab components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#f4f5f7', // Jira-like light gray
  padding: theme.spacing(1),
  position: 'sticky', // Keep tabs fixed at the top
  top: 0,
  zIndex: 1,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '14px',
  color: '#42526e', // Jira's muted text color
  padding: theme.spacing(1, 3),
  minHeight: '40px',
  '&.Mui-selected': {
    color: '#0052cc', // Jira's blue for active tab
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  '&:hover': {
    color: '#0052cc',
    backgroundColor: '#ebecf0', // Subtle hover effect
    borderRadius: '6px',
  },
  transition: 'all 0.2s ease-in-out',
}));

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: '100vw', // Full viewport width
        height: '100vh', // Full viewport height
        display: 'flex',
        flexDirection: 'column', // Stack tabs and content vertically
        backgroundColor: '#f4f5f7', // Jira-like background for the whole page
        // fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        overflow: 'hidden', // Prevent page-level scrolling
      }}
    >
      <StyledTabs
        value={value}
        onChange={handleChange}
        aria-label="market department tabs"
        variant="scrollable" // Allow scrolling for many tabs
        scrollButtons="auto"
        sx={{ flexShrink: 0 }} // Prevent tabs from shrinking
      >
        <StyledTab label="Market Wise Insights" {...a11yProps(0)} />
        <StyledTab label="Department Wise Insights" {...a11yProps(1)} />
        <StyledTab label="DM Insights" {...a11yProps(2)} />
        <StyledTab label="Tickets Created By" {...a11yProps(3)} />
        <StyledTab label="Tickets Now At" {...a11yProps(4)} />
      </StyledTabs>
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}> {/* Content takes remaining space */}
        <Market_Department value={value} index={0}>
          <MarketWise />
        </Market_Department>
        <Market_Department value={value} index={1}>
          <DepartmentWise />
        </Market_Department>
        <Market_Department value={value} index={2}>
          <DM_insights />
        </Market_Department>
        <Market_Department value={value} index={3}>
          <User_Insights />
        </Market_Department>
        <Market_Department value={value} index={4}>
          <TicketsNowAt />
        </Market_Department>
      </Box>
    </Box>
  );
}