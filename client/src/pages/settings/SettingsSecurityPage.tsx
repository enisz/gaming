import { useForm } from "react-hook-form";
import Request from "../../utils/Request";
import useUserContext from "../../hooks/useUserContext";
import toast from 'react-hot-toast';
import { useState } from "react";
import Toast from "../../components/Toast";

export default function SettingsSecurityPage(): JSX.Element {
    const { register, handleSubmit, setError, setValue, formState: { errors } } = useForm();
    const { user } = useUserContext();
    const [saving, setSaving] = useState<boolean>(false);

    const onSubmit = (data: any) => {
        if(data.currentPassword === data.newPassword) {
            setError("newPassword", { type: "same"});
            return;
        }

        if(data.newPassword !== data.newPasswordAgain) {
            setError("newPasswordAgain", { type: "identical"} );
            return;
        }

        setSaving(true);
        Request.post("/api/v1/auth/login", { username: user.unm, password: data.currentPassword })
        .then(() => {
            Request.put(`/api/v1/auth/user`, { password: data.newPassword })
            .then(() => {
                toast(() => <Toast type="success" message="Your password is updated successfully!" />);
                setValue("currentPassword", "")
                setValue("newPassword", "")
                setValue("newPasswordAgain", "")
            })
            .catch((error: any) => toast(() => <Toast type="danger" message="Failed to update your password!" />))
        })
        .catch(() => setError("currentPassword", { type: "invalid" }))
        .finally(() => setSaving(false))
    }

    return (
        <>
            <div className="card shadow mb-4">
                <div className="card-body">
                    <h5 className="card-title"><i className="fas fa-shield-alt fa-fw me-1"></i> Security</h5>
                    <p className="card-text">
                        Security settings.
                    </p>

                    <h6 className="card-subtitle mb-2 text-muted">Password</h6>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label htmlFor="current-password" className="form-label">Your current password:</label>
                            <input type="password" className={`form-control ${errors.currentPassword && "is-invalid"}`} id="current-password" {...register("currentPassword", { required: true })} />
                            { (errors.currentPassword && errors.currentPassword.type === "required") && <div className="invalid-feedback">This field cannot be empty!</div>}
                            { (errors.currentPassword && errors.currentPassword.type === "invalid") && <div className="invalid-feedback">Your password is invalid!</div>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="new-password" className="form-label">Your new password:</label>
                            <input type="password" className={`form-control ${errors.newPassword && "is-invalid"}`} id="new-password" {...register("newPassword", { required: true})} />
                            { (errors.newPassword && errors.newPassword.type === "required") && <div className="invalid-feedback">This field cannot be empty!</div>}
                            { (errors.newPassword && errors.newPassword.type === "same") && <div className="invalid-feedback">The new password has to be different than the old one!</div>}
                        </div>

                        <div className="mb-4 is-invalid">
                            <label htmlFor="new-password-again" className="form-label">Your new password again:</label>
                            <input type="password" className={`form-control ${errors.newPasswordAgain && "is-invalid"}`} id="new-password-again" {...register("newPasswordAgain", { required: true})} />
                            { (errors.newPasswordAgain && errors.newPasswordAgain.type === "required") && <div className="invalid-feedback">This field cannot be empty!</div>}
                            { (errors.newPasswordAgain && errors.newPasswordAgain.type === "identical") && <div className="invalid-feedback">The passwords doesn't match!</div>}
                        </div>

                        <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                            <button className="btn btn-primary" type="submit" disabled={saving}>Update Password</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}