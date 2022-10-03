import { Redirect, Route, RouteProps, useLocation } from "react-router";

export default function PrivateRoute(props: RouteProps): JSX.Element {
    const location = useLocation();
    
    const userData = sessionStorage.getItem("jwt") || localStorage.getItem("jwt");

    return userData !== null
        ? <Route {...props} />
        : <Redirect
            to={{
                pathname: "/auth/login",
                state: { from: location.pathname }
            }}
        />
}