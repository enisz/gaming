import { useEffect, useState, useRef, FormEvent } from "react";
import toast from 'react-hot-toast';
import Request from "../../utils/Request";
import useThemeContext from "../../hooks/useThemeContext";
import useUserContext from "../../hooks/useUserContext";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";

interface UserData {
    [key: string]: any;
    username: string;
    email: string;
    theme: string;
}

export default function SettingsProfilePage(): JSX.Element {
    const [loading, setLoading] = useState<boolean>(true);
    const { setTheme, getTheme } = useThemeContext();
    const { user } = useUserContext();
    const [userData, setUserData] = useState<UserData>({ username: user.unm, email: "", theme: getTheme() });
    const userTheme = useRef<string>(getTheme());
    const [isDirty, setIsDirty] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        Request.get("/api/v1/user/me")
        .then(res => res.data)
        .then(user => {
            setUserData({
                username: user.username,
                email: user.email,
                theme: user.theme
            })

            userTheme.current = user.theme;
        })
        .catch(error => toast(<Toast type="danger" message="Failed to load user information!" />))
        .finally(() => setLoading(false))

        return () => setTheme(userTheme.current);
    }, [setTheme]);

    const handleChange = (event: FormEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = event.currentTarget;

        const copy: UserData = {...userData};
        copy[name] = value;

        if(name === "theme") {
            setTheme(value);
        }

        setUserData(copy);
        setIsDirty(true);
    }

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        
        Request.put(`/api/v1/auth/user`, { email: userData.email, theme: userData.theme })
        .then(res => res.data)
        .then(res => {
            userTheme.current = userData.theme;
            setIsDirty(false);
            toast(() => <Toast type="success" message="Profile Successfully Updated!" />);
        })
        .catch(error => toast(() => <Toast type="danger" message={error} />))
    }

    return (
        <>
            { loading &&
                <div className="card shadow">
                    <div className="card-body">
                        <Spinner label="Loading User Information..." />
                    </div>
                </div>
            }

            { !loading &&
                <div className="card shadow">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <h5 className="card-title"><i className="fas fa-user-circle fa-fw me-1"></i> Profile</h5>
                            <p className="card-text">
                                Profile details.
                            </p>
                            <h6 className="card-subtitle mb-2 text-muted">User Information</h6>
                            
                            <div className="mb-4">
                                <label htmlFor="username" className="form-label">Username:</label>
                                <input type="text" className="form-control" id="username" disabled defaultValue={userData.username} />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="form-label">E-mail:</label>
                                <input type="email" name="email" className="form-control" id="email" onChange={handleChange} value={userData.email} />
                            </div>
                        
                            <h6 className="card-subtitle mb-2 text-muted">Site Theme</h6>
                                <div className="mb-4">
                                    <select className="form-select" name="theme" onChange={handleChange} defaultValue={userData.theme}>
                                        <option value="default">default</option>
                                        <option value="cerulean">cerulean</option>
                                        <option value="cosmo">cosmo</option>
                                        <option value="cyborg">cyborg</option>
                                        <option value="darkly">darkly</option>
                                        <option value="flatly">flatly</option>
                                        <option value="journal">journal</option>
                                        <option value="litera">litera</option>
                                        <option value="lumen">lumen</option>
                                        <option value="lux">lux</option>
                                        <option value="materia">materia</option>
                                        <option value="minty">minty</option>
                                        <option value="morph">morph</option>
                                        <option value="pulse">pulse</option>
                                        <option value="quartz">quartz</option>
                                        <option value="sandstone">sandstone</option>
                                        <option value="simplex">simplex</option>
                                        <option value="sketchy">sketchy</option>
                                        <option value="slate">slate</option>
                                        <option value="solar">solar</option>
                                        <option value="spacelab">spacelab</option>
                                        <option value="superhero">superhero</option>
                                        <option value="united">united</option>
                                        <option value="vapor">vapor</option>
                                        <option value="yeti">yeti</option>
                                        <option value="zephyr">zephyr</option>
                                    </select>
                                </div>

                            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                <button className="btn btn-primary" type="submit" disabled={!isDirty}>Update Profile</button>
                            </div>
                        </form>
                    </div>            
                </div>
            }
        </>
    );
}