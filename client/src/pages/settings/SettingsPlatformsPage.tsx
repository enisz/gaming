import { useForm } from 'react-hook-form';
import { useState, useEffect, Fragment } from "react";
import Spinner from "../../components/Spinner";
import Request from "../../utils/Request";
import toast from 'react-hot-toast';
import Toast from '../../components/Toast';

// interface Platform {
//     _id: string;
//     id: number;
//     name: string;
//     slug: string;
//     platform_logo?: {
//         id: number;
//         image_id: string;
//     },
//     platform_family?: {
//         id: number;
//         name: string;
//         slug: string;
//     }
// }

// interface PlatformGroup {
//     _id: string | null;
//     count: number;
//     items: Platform[];
// }

interface Platform {
    id: number;
    name: string;
    slug: string;
}

interface PlatformGroup {
    id: number | null;
    count: number;
    family: string | null;
    platforms: Platform[],
}

export default function SettingsPlatformsPage(): JSX.Element {
    const [platforms, setPlatforms] = useState<PlatformGroup[]>([]);
    const { register, handleSubmit, setValue, formState } = useForm();
    const { isDirty } = formState;

    useEffect(
        () => {
            Promise.all([
                Request.get("/api/v1/platforms/group").then(res => res.data),
                Request.get("/api/v1/user/me").then(res => res.data)
            ])
            .then(res => {
                setPlatforms(res[0]);
                setValue("ids", res[1].platforms.map((id: number) => id.toString()))
            })
            .catch((error: any) => alert(error))
        }, [setValue]
    );

    const onSubmit = (data: { ids: string[]}) => {
        if(data.ids.length === 0) {
            toast(() => <Toast type="danger" message="Add at least one device as your search results will be filtered to see only the games for your platforms!" />);
            return;
        }

        Request.put(`/api/v1/auth/user`, { platforms: data.ids.map((id: string) => parseInt(id)) })
        .then(() => toast(() => <Toast type="success" message="Your platforms are saved successfully!" />))
        .catch((error: any) => toast(() => <Toast type="danger" message="Failed to save your changes!" />));
    }
    return (
        <>
            <div className="card shadow mb-4">
                <div className="card-body">
                    <h5 className="card-title"><i className="fas fa-laptop fa-fw me-1"></i> Platforms</h5>
                    <p className="card-text">
                        Here you can save your owned devices. At least one device is required as the search engine is using this data to filter your search results.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)}>
                    { platforms.length === 0
                        ? <Spinner label="Loading Platforms..." />
                        : <div className="accordion mb-3" id="platform-accordion">
                            { platforms.map((platformGroup: PlatformGroup, index: number) => (
                                <div className="accordion-item" key={`accordion-item-${index}`}>
                                    <h2 className="accordion-header" id={`heading-${index}`}>
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${index}`}>
                                        {platformGroup.family ? platformGroup.family : "Other" } <span className="badge bg-secondary translate-middle rounded-pill ms-4">{platformGroup.count}</span>
                                    </button>
                                    </h2>
                                    <div id={`collapse-${index}`} className="accordion-collapse collapse" data-bs-parent="#platform-accordion">
                                        <div className="accordion-body px-0 py-0">
                                            <table className="table table-hover">
                                                <tbody>
                                                    { platformGroup.platforms.map((platform: Platform, index: number) => (
                                                        <tr key={`row-${platform.slug}-${index}`}>
                                                            <td>
                                                                <div className="form-check form-switch d-flex flex-row justify-content-between ps-0">
                                                                    <label className="form-check-label" htmlFor={`platform-${platform.slug}-${index}`} style={{ cursor: "pointer" }}>{platform.name}</label>
                                                                    <input className="form-check-input" type="checkbox" id={`platform-${platform.slug}-${index}`} value={platform.id} {...register("ids", {})} style={{ cursor: "pointer" }} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )) }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button className="btn btn-primary" type="submit" disabled={!isDirty}>Save Changes</button>
                    </div>

                    </form>
                </div>
            </div>
        </>
    );
}