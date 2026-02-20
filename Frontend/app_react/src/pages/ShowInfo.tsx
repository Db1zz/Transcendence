import React, { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

function ShowInfo() {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === "ADMIN") {
      getInfo();
    }
  }, [loading, isAuthenticated, user?.role]);

  const getInfo = () => {
    axios
      .get("http://localhost:8080/api/info", { withCredentials: true })
      .then((res) => {
        console.log("admin info =", res);
      })
      .catch((err) => {
        console.log("err=", err);
      });
  };

  if (user?.role === "ADMIN") {
    return <div>secured admin page</div>;
  }

  return <div>default PAGE</div>;
}

export default ShowInfo;
