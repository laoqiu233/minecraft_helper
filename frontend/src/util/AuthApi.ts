import apiClient from "../API"
import { store } from "../app/store"

export async function exchangeGithubToken(code: String): Promise<string> {
  try {
    const response = await apiClient.get(`/auth/github?token=${code}`)
    if (response.data.accessToken) {
      return response.data.accessToken
    }
    throw new Error("access token not found in response")
  } catch (error) {
    alert(error)
    throw error
  }
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get("/auth/user")
    return response.data
  } catch (error) {
    alert(error)
    throw error
  }
}
