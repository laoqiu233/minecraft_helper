import axios from "axios"
import { store } from "./app/store"

const apiClient = axios.create({ baseURL: "http://localhost:8080/api" })

apiClient.interceptors.request.use((req) => {
  const token = store.getState().auth.accessToken

  console.log(store.getState())

  if (token !== undefined) {
    req.headers.Authorization = `bearer ${token}`
  }

  return req
})

export default apiClient
