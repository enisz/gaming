import { useEffect } from "react";
import useSiteHeaderContext from "../hooks/useSiteHeaderContext";
import useUserContext from "../hooks/useUserContext";

export default function HomePage(): JSX.Element {
    const { user } = useUserContext();
    const { setPreset } = useSiteHeaderContext();

    useEffect(() => {
        setPreset("default");
    }, [setPreset])

    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-body">
                            homepage

                            <pre>
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}