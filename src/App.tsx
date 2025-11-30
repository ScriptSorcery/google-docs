import { Route, Routes } from "react-router"
import List from "./pages/List"
import Profile from "./pages/Profile"
import Page from "./pages/Page"

function App() {
  return (
    <Routes>
      <Route index element={<List />} />
      <Route path="doc/new" element={<Page />} />
      <Route path="doc/:id" element={<Page />} />
      <Route path="profile" element={<Profile />} />

      {/* <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route path="concerts">
        <Route index element={<ConcertsHome />} />
        <Route path=":city" element={<City />} />
        <Route path="trending" element={<Trending />} />
      </Route> */}
    </Routes>

  )
}

export default App