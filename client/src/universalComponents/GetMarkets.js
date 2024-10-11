import { apiRequest } from "../lib/apiRequest";


const removeDuplicates = (array) => {
  return [...new Set(array)];
};

const getMarkets = async () => {
  try {
    const marketResponse = await apiRequest.get('/market/getmarkets');
    const uniqueMarketData = removeDuplicates(marketResponse.data || []);
    return uniqueMarketData.map(market => ({ market })); 
  } catch (error) {
    console.error('Error fetching data:', error);
    return []; 
  }
};

export default getMarkets;
