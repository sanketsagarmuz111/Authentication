import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../lib/api";
import { AppContext } from "./AppContext";

export const AppContextProvider = ({ children }) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(false);

  const backendUrl = api.defaults.baseURL;

  const getUserData = useCallback(async ({ showError = true } = {}) => {
    try {
      const { data } = await api.get("/api/user/data");

      if (data.success) {
        setIsLoggedin(true);
        setUserData(data.userData);
        return data.userData;
      }

      setIsLoggedin(false);
      setUserData(false);
      if (showError && data.message !== "Not Authorized Login Again") {
        toast.error(data.message);
      }
      return false;
    } catch (error) {
      setIsLoggedin(false);
      setUserData(false);
      if (showError) toast.error(error.message);
      return false;
    }
  }, []);

  useEffect(() => {
    getUserData({ showError: false });
  }, [getUserData]);

  const value = useMemo(() => ({
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  }), [backendUrl, getUserData, isLoggedin, userData]);

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};
