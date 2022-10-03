import { Fragment, useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { IGDBImage } from "../utils/Helper";
import Request from "../utils/Request";

interface Game {
    id: number;
    cover: {
        id: number;
        image_id: string;
    },
    name: string;
    slug: string;
}

interface Collection {
    platform: {
        id: number;
        name: string;
    },
    games: Game[]
}

export default function CollectionPage(): JSX.Element {
    const [loading, setLoading] = useState<boolean>(true);
    const [collection, setCollection] = useState<Collection[]>([]);

    useEffect(() => {
        setLoading(true);
        Request.get("/api/v1/user/collection", { collection : "games" })
        .then(res => res.data)
        .then((response: Collection[]) => setCollection(response))
        .catch((error: any) => toast(() => <Toast type="danger" message={error} />))
        .finally(() => setLoading(false));
    }, []);

    return (
        <>
            { loading &&
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow">
                                <div className="card-body">
                                    <Spinner label="Loading Your Collection..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            { (!loading && collection.length === 0) &&
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow">
                                <div className="card-body">
                                    Your Collection is empty!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            { (!loading && collection.length > 0) &&
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow">
                                <div className="card-body">
                                    <h5 className="card-title"><i className="fas fa-book-reader fa-fw me-1"></i> Collection</h5>
                                    { collection.map((current: Collection, index: number) => {

                                        if(!current.games.length) {
                                            return null;
                                        }
                                        
                                        return (
                                            <Fragment key={`collection-${index}`}>
                                                <h6 className="card-subtitle mb-2 text-muted">{current.platform.name}</h6>
                                                <div className="row">
                                                    { current.games.map((game: Game, index: number) => (
                                                        <div key={`game-${game.slug}`} className="col-1 mb-4">
                                                            <img className="img-fluid" src={game.cover ? IGDBImage(game.cover.image_id, "cover_small") : "https://via.placeholder.com/90x128.jpg?text=missing%20cover"} alt={game.name} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* <Modal /> */}
        </>
    );
}