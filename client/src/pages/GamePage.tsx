import { FunctionComponent, useState, useEffect } from "react";
import { useParams } from "react-router";
import toast from 'react-hot-toast';
import Spinner from "../components/Spinner";
import Request from "../utils/Request";
import { IGDBImage, randomInt, youtubeThumbnail, youtubeVideo } from '../utils/Helper'
import useSiteHeaderContext from "../hooks/useSiteHeaderContext";
import MediaLister from '../components/MediaLister';
import StarBar from "../components/StarBar";
import Toast from "../components/Toast";
import useTimeAgo from "../hooks/useTimeAgo";

interface Game {
    id: number;
	name: string;
    cover?: {
        id: number;
        image_id: string;
    }
    artworks?: [{
        id: number;
        image_id: string;
    }]
	first_release_date?: number;
    platforms?: [{
        id: number;
        name: string;
    }]
	screenshots?: [{
        id: number;
        image_id: string;
    }]
	slug: string;
	storyline?: string;
	summary?: string;
    videos?: [{
        id: number;
        name: string;
        video_id: string;
    }],
    bundles: [{
        id: number;
        name: string;
        version_title: string;
    }],
    dlcs: [{
        id: number;
        name: string;
    }];
    total_rating?: number;
}

export default function GamePage(): JSX.Element {
    const { id, slug } = useParams<{ id: string; slug: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [game, setGame] = useState<Game>({id: 0, name: "", slug: "", bundles: [{ id: 0, name: "", version_title: ""}], dlcs: [{ id: 0, name: ""}]});
    const { setBg, setPreset } = useSiteHeaderContext();
    const [games, setGames] = useState<number[]>([]);
    const [wishlist, setWishlist] = useState<number[]>([]);

    useEffect(() => {
        setLoading(true);
        setPreset("loading")
        
        Request.get(`/api/v1/game/data/${id}/${slug}`)
        .then(res => res.data)
        .then(({game, games, wishlist}: {game: Game; games: number[]; wishlist: number[]}) => {
            setGame(game);
            setGames(games);
            setWishlist(wishlist);

            if(game.artworks) setBg(IGDBImage(game.artworks[randomInt(0, game.artworks.length - 1)].image_id, "1080p"));
            else if(game.screenshots) setBg(IGDBImage(game.screenshots[randomInt(0, game.screenshots.length - 1)].image_id, "1080p"));
            else setBg();

            setPreset("gameView");
        })
        .catch(err => toast(() => <Toast type="danger" message={err.message} />))
        .finally(() => setLoading(false));

        return () => { setPreset("default"); setBg(); }
    }, [id, slug, setPreset, setBg]);

    const addToCollection = (collection: string, platformId: number, gameId: number) => {
        Request.put("/api/v1/user/games", { collection: collection, platformId: platformId, gameId: gameId })
        .then(() => {
            if(collection === "games") {
                setGames((currentState: number[]) => {
                    const copy = [...currentState];
                    copy.push(platformId);
                    return copy;
                })
            } else {
                setWishlist((currentState: number[]) => {
                    const copy = [...currentState];
                    copy.push(platformId);
                    return copy;
                })
            }
            
            toast(() => <Toast type="success" message={`${game.platforms?.filter(platform => platform.id === platformId)[0].name} version of ${game.name} is added to your ${collection}!`} />);
        })
        .catch(error => {
            if(error.response.status === 409) {
                toast(() => <Toast type="info" message={`${game.name} is already in your ${collection}!`} />);
            } else {
                toast(() => <Toast type="danger" message={`Failed to add ${game.name} to your ${collection}!`} />);
            }
        })
    }

    const removeFromCollection = (collection: string, platformId: number, gameId: number) => {
        Request.delete(`/api/v1/user/games/${platformId}/${gameId}/${collection}`)
        .then(() => {
            toast(() => <Toast type="success" message={`${game.platforms?.filter(platform => platform.id === platformId)[0].name} version of ${game.name} is removed from your ${collection}!`} />)

            if(collection === "games") {
                setGames((currentState: number[]) => {
                    const copy = [...currentState];
                    copy.splice(copy.indexOf(platformId), 1);
                    return copy;
                })
            } else {
                setWishlist((currentState: number[]) => {
                    const copy = [...currentState];
                    copy.splice(copy.indexOf(platformId), 1);
                    return copy;
                })
            }
        })
        .catch(err => toast(() => <Toast type="danger" message={err} />))
    }

    return (
        <>
        {
            loading &&
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow">
                            <div className="card-body">
                                <Spinner label="Loading Game Details..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }

        {
            !loading &&
            <div className="container">
                <div className="row">
                    <div className="col-md-4 col-lg-3 col-12">
                        <HeaderComponent name={game.name} position="top" release_date={game.first_release_date} total_rating={game.total_rating} />
                        <div className="card shadow mb-4">
                            <img src={game.cover ? IGDBImage(game.cover.image_id, "cover_big") : "https://via.placeholder.com/264x374.jpg?text=missing%20cover"} className="card-img-top" alt={game.name} />

                            <div className="list-group list-group-flush">
                                { game.platforms &&
                                    <>
                                        <PlatformSelectorButton icon="fas fa-book-reader" label="games" gameId={game.id} platforms={game.platforms} add={addToCollection} remove={removeFromCollection} owned={games} />
                                        <PlatformSelectorButton icon="far fa-meh-rolling-eyes" label="wishlist" gameId={game.id} platforms={game.platforms} add={addToCollection} remove={removeFromCollection} owned={wishlist} />
                                    </>
                                }
                            </div>
                            {/* <div className="card-body">
                                <h5 className="card-title">{game.name}</h5>
                                {
                                    game.first_release_date &&
                                    <>
                                        <h6 className="card-subtitle mb-2 text-muted  mt-3">Release Date</h6>
                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item">{`${dateParser.parse('jo', new Date(game.first_release_date * 1000))} of ${dateParser.parse('F, Y', new Date(game.first_release_date * 1000))}`}</li>
                                        </ul>
                                    </>
                                }
                                { game.platforms &&
                                    <>
                                        <h6 className="card-subtitle mb-2 text-muted mt-3">Platform{game.platforms.length > 1 ? "s" : ""}</h6>
                                        <ul className="list-group list-group-flush">
                                            {game.platforms.map(platform => <li key={`platforms-menu-${platform.id}`} className="list-group-item">{platform.name}</li>)}
                                        </ul>
                                    </>
                                }
                                {
                                    game.bundles.length > 0 &&
                                    <>
                                        <h6 className="card-subtitle mb-2 text-muted mt-3">Bundles</h6>
                                        <ul className="list-group list-group-flush">
                                            {game.bundles.map(bundle => <li key={`bundles-menu-${bundle.id}`} className="list-group-item">{bundle.version_title}</li>)}
                                        </ul>
                                    </>
                                }
                                {
                                    game.dlcs.length > 0 &&
                                    <>
                                        <h6 className="card-subtitle mb-2 text-muted mt-3">DLCs</h6>
                                        <ul className="list-group list-group-flush">
                                            {game.dlcs.map(dlc => <li key={`dlc-menu-${dlc.id}`} className="list-group-item">{dlc.name}</li>)}
                                        </ul>
                                    </>
                                }
                            </div> */}
                        </div>
                    </div>

                    <div className="col-md-8 col-lg-9 col-12">
                        <HeaderComponent name={game.name} position="side" release_date={game.first_release_date} total_rating={game.total_rating} />
                        { game.storyline &&
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <h5 className="card-title"><i className="fas fa-ticket-alt fa-fw me-1"></i> Storyline</h5>
                                    <p className="card-text">{game.storyline}</p>
                                </div>
                            </div>
                        }

                        { game.summary &&
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <h5 className="card-title">Summary</h5>
                                    <p className="card-text">{game.summary}</p>
                                </div>
                            </div>
                        }

                        { (game.artworks || game.screenshots || game.videos) &&
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        <i className="fas fa-photo-video fa-fw me-1"></i> Media
                                    </h5>

                                    { game.artworks &&
                                        <MediaLister
                                            title="Artworks"
                                            thumbs={game.artworks.map(artwork => IGDBImage(artwork.image_id, "cover_big"))}
                                            sources={game.artworks.map(artwork => IGDBImage(artwork.image_id, "1080p"))}
                                            type="image"
                                        />
                                    }

                                    { game.screenshots &&
                                        <MediaLister
                                            title="Screenshots"
                                            thumbs={game.screenshots.map(screenshot=> IGDBImage(screenshot.image_id, "cover_big"))}
                                            sources={game.screenshots.map(screenshot => IGDBImage(screenshot.image_id, "1080p"))}
                                            type="image"
                                        />
                                    }

                                    { game.videos &&
                                        <MediaLister
                                            title="Videos"
                                            thumbs={game.videos.map(video => youtubeThumbnail(video.video_id, "sddefault"))}
                                            sources={game.videos.map(video => youtubeVideo(video.video_id))}
                                            type="youtube"
                                        />
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        }
        </>
    );
}

interface PlatformSelectorButtonInterface {
    label: string;
    icon: string;
    gameId: number;
    platforms: [{
        id: number;
        name: string;
    }];
    add: (collection: string, platformId: number, gameId: number) => void;
    remove: (collection: string, platformId: number, gameId: number) => void;
    owned: number[];
}

const PlatformSelectorButton: FunctionComponent<PlatformSelectorButtonInterface> = ({ label, icon, gameId, platforms, add, remove, owned }): JSX.Element => {
    const buttons = platforms.sort((a, b) => {
        const textA = a.name.toUpperCase();
        const textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    })

    return (
        <div className="dropdown">
            <button type="button" className="list-group-item list-group-item-action dropdown-toggle" data-bs-toggle="dropdown" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <i className={`${icon} fa-fw me-2`}></i> <span className="me-auto">Your {`${label.charAt(0).toUpperCase()}${label.substring(1)}`}...</span>
            </button>

            <ul className="dropdown-menu">
                {/* { buttons.map((platform: { id: number, name: string }, index: number) => <li key={`platform-selector-${index}`}><button className="dropdown-item" onClick={() => callback(platform.id, gameId)} disabled={exclude.indexOf(platform.id) > -1}>{platform.name} version</button></li> ) } */}
                {
                    buttons.map(
                        (platform: { id: number, name: string}, index: number) => {
                            const platformOwned = owned.indexOf(platform.id) !== -1;

                            return (
                                <li key={`platform-selector-${index}`}>
                                    <button className="dropdown-item" onClick={() => {platformOwned ? remove(label, platform.id, gameId) : add(label, platform.id, gameId)}}>
                                        <i className={`${platformOwned ? "fas fa-minus" : "fas fa-plus"} fa-fw me-2`}></i> {platform.name} version
                                    </button>
                                </li>
                            )
                        }
                    )
                }
            </ul>
        </div>
    );
}

interface HeaderComponentInterface {
    name: string;
    release_date?: number;
    total_rating?: number;
    position: "top" | "side";
}

const dateParser = require("node-date-parser");

const HeaderComponent: FunctionComponent<HeaderComponentInterface> = ({ name, release_date, total_rating, position }: HeaderComponentInterface): JSX.Element => {
    const timeAgo = useTimeAgo();

    return (
        <div className={`d-flex flex-row justify-content-between ${position === "top" ? "d-block d-md-none mb-3" : "d-none d-sm-none d-md-block mb-5"}`}>
            <div>
                <h1><strong className="text-white">{name}</strong></h1>

                { release_date &&
                    <h5 className="text-white">
                        {dateParser.parse('j', new Date(release_date * 1000))} <sup>{dateParser.parse('o', new Date(release_date * 1000))}</sup> of {dateParser.parse('F, Y', new Date(release_date * 1000))} ({timeAgo.format(new Date(release_date * 1000))})
                    </h5>
                }

                { total_rating && <StarBar percentage={total_rating} textual /> }
            </div>
        </div>
    );
}