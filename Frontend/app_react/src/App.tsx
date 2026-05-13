import {
  BrowserRouter as Router,
  Outlet,
} from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <>
      <LoginPage />
      <Outlet />
    </>
  );
}

export default App;
