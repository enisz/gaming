import { useState } from "react";
import { useEffect } from "react";
import Request from '../utils/Request';
import Spinner from '../components/Spinner';
import useTimeAgo from '../hooks/useTimeAgo';
import useSiteHeaderContext from '../hooks/useSiteHeaderContext';
import useUserContext from '../hooks/useUserContext';
import { NavLink } from "react-router-dom";
import Pager from '../components/Pager';

interface User {
    _id: string;
    username: string;
    registered: number;
}

interface PagerController {
    page: number;
    limit: number;
    count: number;
}

export default function UsersPage(): JSX.Element {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { setPreset } = useSiteHeaderContext();
    const timeAgo = useTimeAgo();
    const { user } = useUserContext();
    const [pager, setPager] = useState<PagerController>({ page: 1, limit: 25, count: 0});

    useEffect(() => {
        setLoading(true);
        setPreset("loading");
        Request.get(`/api/v1/user/all?page=${pager.page}&limit=${pager.limit}`)
        .then(res => res.data[0])
        .then((response: PagerController & { users: User[] }) => {
            console.log(response);
            setUsers(response.users);
            setPager({ count: response.count, page: response.page, limit: response.limit });
        })
        .catch(error => alert(error))
        .finally(() => {
            setLoading(false)
            setPreset("default");
        });
    }, []);

    return (
        <>
                { loading &&
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="card shadow">
                                    <div className="card-body">
                                        <Spinner label="Loading Users..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                { !loading &&
                    <div className="container">
                        <div className="row">
                            <div className="col-12 mb-3">
                                <Pager />
                            </div>
                        </div>
                        <div className="row">
                            { users.map((currentUser: User) => (
                                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-3">
                                    <div className={`card mb-4 shadow position-relative ${user.uid === currentUser._id ? "border border-info" : ""}`}>
                                        <div className="row g-0">
                                            <div className="col-md-4">
                                                <img src="img/avatar.png" className="img-fluid rounded-start" alt="username" />
                                            </div>
                                            <div className="col-md-8">
                                                <div className="card-body">
                                                    <h5 className="card-title">{currentUser.username}</h5>
                                                    {/* <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p> */}
                                                    <p className="card-text"><small className="text-muted">Member since: {timeAgo.format(currentUser.registered)}</small></p>
                                                    <NavLink className="stretched-link" to={`/users/${encodeURIComponent(currentUser.username)}`}></NavLink>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) }
                        </div>
                    </div>
                }
            </>
    );
}