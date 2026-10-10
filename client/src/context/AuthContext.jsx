import { createContext, useContext, useState } from 'react';
import api from '../api/axios'

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user , setUser] = useState(null);
    const [token , setToken] = useState(null);

    // login function 
    const login = async (email , password) => {
        const response = await api.post("/auth/login",{
            email,
            password,
        });

        const receivedToken = response.data.token;
        const receivedUser = response.data.user;

        if(!receivedToken){
            throw new Error("Login response did not contain a token");
        }

        setToken(receivedToken);
        setUser(receivedUser);

        // Add JWT to future axios requests
        api.defaults.headers.common.Authorization = `Bearer ${receivedToken}`;

        return receivedUser
    };

    // logout function 
    const logout = () => {
        setUser(null);
        setToken(null);

        // remove JWT from future axios requests
        delete api.defaults.headers.common.Authorization;
    };

    // values shared with other components 
    const value = {
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if(!context){
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
