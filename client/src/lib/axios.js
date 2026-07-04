import axios from "axios"

const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "")

export const axiosInstance = axios.create({
    baseURL: backendUrl ? `${backendUrl}/api` : (import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api"),
    withCredentials: true,
})