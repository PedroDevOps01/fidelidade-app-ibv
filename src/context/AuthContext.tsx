import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useTokenRefresh from "../hooks/useTokenRefresh";

// Initial State
export const initialAuthState: AuthorizationData = {
  access_token: "",
  token_type: "",
  expires_in: 0,
  menu_permission: [],
  permission: [],
};

// Types for the reducer
type Action =
  | { type: "SET_AUTH_DATA"; payload: AuthorizationData }
  | { type: "CLEAR_AUTH_DATA" };

const authReducer = (
  state: AuthorizationData,
  action: Action
): AuthorizationData => {
  switch (action.type) {
    case "SET_AUTH_DATA":
      return { ...state, ...action.payload };
    case "CLEAR_AUTH_DATA":
      return initialAuthState;
    default:
      return state;
  }
};

const AuthContext = createContext<{
  authData: AuthorizationData;
  setAuthData: (data: AuthorizationData) => void;
  clearAuthData: () => void;
}>({
  authData: initialAuthState,
  setAuthData: () => {},
  clearAuthData: () => {},
});

const getInitialAuthState = async (): Promise<AuthorizationData> => {
  try {
    const savedAuthData = await AsyncStorage.getItem("authorization");
    return savedAuthData ? JSON.parse(savedAuthData) : initialAuthState;
  } catch (error) {
    console.log("Failed to load auth data from storage:", error);
    return initialAuthState;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authData, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const loadAuthData = async () => {
      const initialData = await getInitialAuthState();
      dispatch({ type: "SET_AUTH_DATA", payload: initialData });
    };
    loadAuthData();
  }, []);


  
  const setAuthData = async (data: AuthorizationData) => {
    try {
      await AsyncStorage.setItem("authorization", JSON.stringify(data));
      dispatch({ type: "SET_AUTH_DATA", payload: data });
    } catch (error) {
      console.log("Failed to save auth data to storage:", error);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem("authorization");
      dispatch({ type: "CLEAR_AUTH_DATA" });
    } catch (error) {
      console.log("Failed to clear auth data from storage:", error);
    }
  };

  const refreshToken = async () => {
    try {
      const request = await fetch("http://52.20.221.114/api/refresh", {
        method: "POST",
        headers: {
          Accept: "application/json",
          authorization: `bearer ${authData.access_token}`,
        },
      });

      if (request.status === 200) {
        const response = await request.json();
        await AsyncStorage.setItem("authorization", JSON.stringify(response.authorization));
        setAuthData(response.authorization);
      }

      console.log("Token refreshed at", new Date().toLocaleTimeString());
    } catch (error) {
      console.log("Failed to refresh token:", error);
    }
  };

  useTokenRefresh(refreshToken, 10000, authData.access_token !== "");

  return (
    <AuthContext.Provider value={{ authData, setAuthData, clearAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
