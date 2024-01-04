import axios from "axios"

const API = axios.create({ baseURL: "http://localhost:8080/api" })

API.interceptors.request.use((req) => {
  // if (localStorage.getItem("user")) {
  //   req.headers.Authorization = `Bearer ${
  //     JSON.parse(localStorage.getItem("user")).token
  //   }`;
  // }
  return req
})

export default API
