import { useForm } from 'react-hook-form';
import { NavLink, useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import Request from '../utils/Request';
import Toast from '../components/Toast';

export default function RegisterPage(): JSX.Element {
    const { register, setError, handleSubmit, formState: { errors } } = useForm();
    const history = useHistory();

    const onSubmit = (data: any) => {
        if(data.password !== data.password2) {
            setError("password2", { type: "identical" })
            return;
        }

        const { username, password, email } = data;
        Request.post("/api/v1/auth/register", { username: username, password: password, email: email })
        .then(
            (res: any) => {
                toast(() => <Toast type="success" message={`Account Created Succesfully!`} />);
                history.push("/auth/login");
            }
        )
        .catch(
            (error: any) => {
                const status: number = error.request.status;

                // conflict, already exists
                if(status === 409) {
                    toast(() => <Toast type="danger" message={`Username "${username}" is already taken!`} />);
                    setError("username", { type: "taken" });
                } else {
                    toast(() => <Toast type="danger" message={`Something went wrong!`} />);
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
                            <h5 className="card-title">Create Account!</h5>
                            <h6 className="card-subtitle mb-4 text-muted">New user</h6>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="input-group mb-3">
                                    <span className="input-group-text text-muted">
                                        <i className="fas fa-user"></i>
                                    </span>
                                    <input type="text" className={`form-control ${errors.username && "is-invalid"}`} placeholder="username" {...register("username", {required: true })} />
                                    { (errors.username && errors.username.type === "required") && <div className="invalid-feedback">Username cannot be empty!</div> }
                                    { (errors.username && errors.username.type === "taken") && <div className="invalid-feedback">Username is already taken!</div>}
                                </div>

                                <div className="input-group mb-3">
                                    <span className="input-group-text text-muted">
                                        <i className="fas fa-key"></i>
                                    </span>
                                    <input type="password" className={`form-control ${errors.password && "is-invalid"}`} placeholder="password" {...register("password", {required: true })} />
                                    <div className="invalid-feedback">Password cannot be empty!</div>
                                </div>

                                <div className="input-group mb-3">
                                    <span className="input-group-text text-muted">
                                        <i className="fas fa-key"></i>
                                    </span>
                                    <input type="password" className={`form-control ${errors.password2 && "is-invalid"}`} placeholder="password again" {...register("password2", {required: true})} />
                                    { (errors.password2 && errors.password2.type === "required") && <div className="invalid-feedback">Password cannot be empty!</div> }
                                    { (errors.password2 && errors.password2.type === "identical") && <div className="invalid-feedback">The passwords doesn't match!</div> }
                                </div>

                                <div className="input-group mb-3">
                                    <span className="input-group-text text-muted">
                                        <i className="fas fa-at"></i>
                                    </span>
                                    <input type="email" className={`form-control ${errors.email && "is-invalid"}`} placeholder="e-mail" {...register("email", {required: true, pattern: /^\S+@\S+$/ })} />
                                    <div className="invalid-feedback">Email cannot be empty!</div>
                                </div>

                                {/*<input type="checkbox" placeholder="remember" {...register("remember", {})} />*/}

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">Create Account</button>
                                    <NavLink to="/auth/login" className="btn btn-secondary">Cancel</NavLink>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}