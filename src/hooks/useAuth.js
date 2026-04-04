import { createContext, useContext } from "react";

const GUEST = { isSignedIn: false, isLoaded: true, userId: null };
export const AuthContext = createContext(GUEST);
export const useAuth = () => useContext(AuthContext);
