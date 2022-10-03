import { useForm } from 'react-hook-form';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Request from '../utils/Request';
import useUserContext from '../hooks/useUserContext';
import { useEffect } from 'react';
import useThemeContext from '../hooks/useThemeContext';
import Toast from '../components/Toast';

export default function LoginPage(): JSX.Element {
    const { register, handleSubmit, setFocus, formState: { errors } } = useForm();
    const { login, authenticated } = useUserContext();
    const location = useLocation<{from?: string}>();
    const history = useHistory();
    const { setTheme } = useThemeContext();

    useEffect(
        () => {
            setFocus("username");
        }, [setFocus]
    );

    useEffect(() => {
        if(authenticated()) {
            const from = location.state?.from;
            history.push(from ? from : "/home");
        }
    }, [authenticated, history, location.state?.from]);

    const onSubmit = (data: any) => {
        Request.post("/api/v1/auth/login", {username: data.username, password: data.password, remember: data.remember})
        .then(res => res.data)
        .then(
            (response: { jwt: string, theme: string}) => {
                const { jwt, theme } = response;
                login(jwt, data.remember);
                setTheme(theme);
                toast(() => <Toast type="info" message={`Hello, ${data.username}!`} />)
            }
        )
        .catch(
            (error: any) => {
                const status: number = error.request?.status;

                // Bad request
                if(status === 400) {
                    toast(() => <Toast type="danger" message="Something went wrong. Try again!" />);
                } else if(status === 403) {
                    toast(() => <Toast type="danger" message="Invalid username or password!" />);
                } else {
                    toast(() => <Toast type="danger" message="Internal Server Error!" />);
                }
            }
        )
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4 mx-auto">
                    <div className="card shadow">
                        <div className="card-body">
                            <h5 className="card-title">Welcome back!</h5>
                            <h6 className="card-subtitle mb-4 text-muted">Log in</h6>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="input-group mb-3">
                                    <span className="input-group-text text-muted">
                                        <i className="fas fa-user"></i>
                                    </span>
                                    <input type="text" className={`form-control ${errors.username && "is-invalid"}`} placeholder="username" {...register("username", {required: true })} />
                                    <div className="invalid-feedback">Username cannot be empty!</div>
                                </div>

                                <div className="input-group mb-3">
                                    <span className="input-group-text text-muted">
                                        <i className="fas fa-key"></i>
                                    </span>
                                    <input type="password" className={`form-control ${errors.password && "is-invalid"}`} placeholder="password" {...register("password", {required: true })} />
                                    <div className="invalid-feedback">Password cannot be empty!</div>
                                </div>

                                <div className="form-check mb-3">
                                    <input className="form-check-input" type="checkbox" id="remember" {...register("remember", {})} />
                                    <label className="form-check-label" htmlFor="remember">
                                        Keep me logged in
                                    </label>
                                </div>

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">Log in</button>
                                    <NavLink to="/auth/register" className="btn btn-secondary">Not a member?</NavLink>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}