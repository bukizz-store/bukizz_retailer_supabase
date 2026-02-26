import axios from 'axios';

const fetchOverview = async () => {
    try {
        console.log("Fetching overview...");
        const res = await axios.get('http://api.bukizz.com/retailer/dashboard/overview'); // Adjust URL if necessary. Assuming production URL for now based on domain patterns, or local. Let's try to find an API URL from the code.
        console.log("Data structure:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

fetchOverview();
