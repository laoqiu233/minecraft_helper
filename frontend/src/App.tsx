
import "./styles.css"
import { AllItems } from "./components/AllItems/AllItems"
import { CraftBoard } from "./components/craftBoard/CraftBoard"
import { fetchRecipe } from "./util/RecipeApi"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { exchangeGithubToken, getUserProfile } from "./util/AuthApi"
import { accessTokenUpdated, fetchAuthorizedUserProfile, loggedOut } from "./features/auth/authSlice"
import apiClient from "./API"
import { UserWidget } from "./components/UserWidget/UserWidget"

const loginButton = (
  <a href={`https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_OAUTH_CLIENT_ID}`} style={{textDecoration: "none"}}>
    <div className="login-button">
      <img src="images/github.svg" width="32"/>
      <span>Login with GitHub</span>
    </div>
  </a>
)

function App() {
  const hasAccessToken = useAppSelector(state => state.auth.accessToken !== undefined)
  const userLoading = useAppSelector(state => state.auth.loading)
  const user = useAppSelector(state => state.auth.user)
  const dispatch = useAppDispatch()

  // Check if redirected from GitHub Oauth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")

    if (code !== null && !hasAccessToken) {
      exchangeGithubToken(code).then(token => {
        localStorage.setItem("accessToken", token)
        window.location.search = ""
        dispatch(accessTokenUpdated(token))
      })
    }

    if (hasAccessToken) {
      dispatch(fetchAuthorizedUserProfile())
      .catch(() => {
        localStorage.removeItem("accessToken")
      })
    }
  }, [hasAccessToken])

  const logout = () => {
    dispatch(loggedOut())
    localStorage.removeItem("accessToken")
  }

  return (
    <div className="app">
      <div className="app-sidebar">
        <AllItems />
      </div>
      <div className="app-main">
        {!userLoading && (user === undefined ? loginButton : <UserWidget user={user} onLogoutClick={logout}/>)}
        <CraftBoard />
      </div>
    </div>
  )
}

export default App
