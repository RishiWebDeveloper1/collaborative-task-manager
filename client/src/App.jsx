import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Manager from "./pages/Manager";
import Member from "./pages/Member";
import Dashboard from "./pages/Dashboard";
import './App.css'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          localStorage.getItem("token") ? <Navigate to="/login" /> : <Login />
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <Admin />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <PrivateRoute>
            <Manager />
          </PrivateRoute>
        }
      />
      <Route
        path="/member"
        element={
          <PrivateRoute>
            <Member />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
