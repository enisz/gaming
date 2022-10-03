import { useRef, useEffect, useMemo } from "react";
import { createContext, FunctionComponent, useState } from "react";
import { useHistory } from "react-router";
import toast from 'react-hot-toast';
import useThemeContext from "../hooks/useThemeContext";
import Request from '../utils/Request';
import Toast from '../components/Toast';
import JwtDecode from 'jwt-decode';
import SocketClient, { Socket, io } from 'socket.io-client';

interface User {
    uid: string;
    unm: string;
}

interface Jwt {
    uid: string;
    unm: string;
    iat: number;
    exp: number;
}

export interface UserContextInterface {
    user: User;
    login: (jwt: string, remember: boolean) => void;
    logout: () => void;
    authenticated: () => boolean;
} 

const UserContext = createContext<UserContextInterface>({
    user: { uid: "", unm: "" },
    login: ()=>{},
    logout: ()=>{},
    authenticated: () => {return false}
});

export default UserContext;

export const UserContextProvider: FunctionComponent = ({children}): JSX.Element => {
    const [user, setUser] = useState<User>({ uid: "", unm: "" });
    const history = useHistory();
    const { setTheme } = useThemeContext();
    const dataFetched = useRef<boolean>(false)
    const socket = useRef<Socket | null>(null);

    const contextValue: UserContextInterface = useMemo(() => {
        return {
            user: user,
            login: (jwt: string, remember: boolean) => {
                if(remember) {
                    localStorage.setItem("jwt", jwt);
                } else {
                    sessionStorage.setItem("jwt", jwt);
                }

                socket.current = io("/");
                const { uid, unm } = JwtDecode(jwt) as Jwt;
                setUser({ uid: uid, unm: unm });
            },
            logout: () => {
                localStorage.clear();
                sessionStorage.clear();
                toast(() => <Toast type="success" message={`${user.unm} logged out!`} />);
                setUser({uid: "", unm: ""});
                socket.current?.close();
                socket.current = null;
                setTheme("default");
                history.push("/auth/login");
            },
            authenticated: () => {
                return user.uid !== "";
            }
        }
    }, [user, history, setTheme])

    useEffect(() => {
        if(!dataFetched.current) {
            dataFetched.current = true;
            const jwt = sessionStorage.getItem("jwt") || localStorage.getItem("jwt");

            if(jwt !== null) {
                const { uid, unm } = JwtDecode(jwt) as Jwt;
                setUser({ uid: uid, unm: unm });

                Request.get("/api/v1/user/me")
                .then(res => res.data)
                .then(user => {
                    setTheme(user.theme);
                    socket.current = io("/");
                })
                .catch((error: any) => {
                    toast(() => <Toast type="danger" message="Failed to validate your credentials. Log in again!" />)
                    contextValue.logout();
                }) 
            }
        }
    }, [contextValue, setTheme]);
    
    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}