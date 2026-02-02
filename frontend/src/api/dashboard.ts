import axios from "axios";

const API_URL = "http://localhost:5000/api";

export async function fetchDashboardSummary() {
  const token = localStorage.getItem("authToken");

  const res = await axios.get(`${API_URL}/dashboard/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
