import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router"
import Spinner from "../components/Spinner";
import Request from "../utils/Request";

interface User {
    _id: string;
    username: string;
    theme: string;
    email: string;
    platforms: number[];
    games: {
        [key: number]: number[];
    };
    wishlist: {
        [key: number]: number[];
    };
    registered: number;
}

export default function ProfilePage(): JSX.Element {
    const params = useParams<{ username: string }>();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        console.log(params.username);
        Request.get(`/api/v1/user/username/${encodeURIComponent(params.username)}`)
        .then(res => res.data)
        .then((userData: User) => {
            setUser(userData);
        })
        .catch()
    }, []);

    return (
        <div className="container">
            { user === null &&
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow">
                            <div className="card-body">
                                <Spinner label="Loading User Data..." />
                            </div>
                        </div>
                    </div>
                </div>
            }

            { user !== null &&
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow">
                            <div className="card-body">
                                <pre>
                                    {JSON.stringify(user, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}