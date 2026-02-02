import axios from "axios";

const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api";

export async function addKeyword(keyword: string) {
  const token = localStorage.getItem("authToken");
  const res = await axios.post(
    `${API_URL}/keywords`,
    { keyword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function deleteKeyword(id: string) {
  const token = localStorage.getItem("authToken");
  const res = await axios.delete(`${API_URL}/keywords/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
