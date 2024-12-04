const axios = require("axios");



async function getPrices(item, quality) {
  const url = `https://west.albion-online-data.com/api/v2/stats/prices/`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

getPrices().then((data) => console.log(data));

