import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import Request from '../utils/Request';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import { IGDBImage } from '../utils/Helper';
import useSiteHeaderContext from "../hooks/useSiteHeaderContext";
import StarBar from "../components/StarBar";
import './SearchPage.scss';
import { NavLink } from "react-router-dom";
import { useRef } from "react";

interface SearchHistory {
    term: string;
    results: Game[];
}

interface Game {
    id: number;
    name: string;
    category?: number;
    slug: string;
    cover?: {
        id: number;
        image_id: string;
    },
    first_release_date?: number;
    platforms?: [{
        id: number;
        name: string;
    }]
    total_rating?: number;
}

export default function SearchPage(): JSX.Element {
    const location = useLocation();
    const queryString = decodeURIComponent(new URLSearchParams(location.search).get("term") as string);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { setSize, setOverlay } = useSiteHeaderContext();
    const searchHistory = useRef<SearchHistory[] | null>(sessionStorage.getItem("search-history") !== null ? JSON.parse(sessionStorage.getItem("search-history") as string) : null);

    useEffect(
        () => {
            let historyFound: boolean = false;
            if(searchHistory.current !== null) {
                const match: SearchHistory[] = searchHistory.current.filter((item: SearchHistory) => item.term === queryString);

                if(match.length === 1) {
                    setGames(match[0].results);
                    historyFound = true;
                } else {
                    historyFound = false;
                }
            }

            if(!historyFound) {
                setLoading(true);
                setSize(250); setOverlay(70)
                
                Request.get(`/api/v1/game/search/${encodeURIComponent(queryString)}`)
                .then(res => res.data)
                .then((result: Game[]) => {
                    if(searchHistory.current === null) {
                        searchHistory.current = [{ term: queryString, results: result }];
                    } else {
                        searchHistory.current.push({ term: queryString, results: result })
                    }
                    
                    sessionStorage.setItem("search-history", JSON.stringify(searchHistory.current))
                    setGames(result);
                    setSize(350);
                    setOverlay(200);
                })
                .catch((error: any) => toast.error("Failed to get the results from the server!"))
                .finally(() => setLoading(false));
            }
        }, [queryString, setOverlay, setSize]
    );

    return (
        <div className="container">
            { loading &&
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow">
                            <div className="card-body">
                                <Spinner label="Loading Games..." />
                            </div>
                        </div>
                    </div>
                </div>
            }

            <div className="row">

            { (!loading && games.length > 0) &&
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-body">
                            <h5 className="card-title"><i className="fas fa-clipboard-list fa-fw me-1"></i> Results</h5>
                            <h6 className="card-subtitle mb-2 text-muted">{games.length} results found for "{queryString}"</h6>
                            { games.map((game: Game, index: number) => {
                                let category: string;

                                switch(game.category) {
                                    case 0:
                                        category = "Main Game";
                                    break;

                                    case 1:
                                        category = "DLC";
                                    break;

                                    case 2:
                                        category = "Expansion";
                                    break;

                                    case 3:
                                        category = "Bundle";
                                    break;

                                    case 4:
                                        category = "Standalone Expansion";
                                    break;

                                    case 5:
                                        category = "Mod";
                                    break;

                                    case 6:
                                        category = "Episode";
                                    break;

                                    case 7:
                                        category = "Season";
                                    break;

                                    case 8:
                                        category = "Remake";
                                    break;

                                    case 9:
                                        category = "Remaster";
                                    break;

                                    case 10:
                                        category = "Expanded Game";
                                    break;

                                    case 11:
                                        category = "Port";
                                    break;

                                    case 12:
                                        category = "Fork";
                                    break;

                                    default: category = "";
                                }

                                return (
                                    <div className="d-flex position-relative mt-4" key={game.slug}>
                                        <div className="flex-shrink-0">
                                            <img onLoad={(event: React.SyntheticEvent) => { event.currentTarget.classList.add("loaded") }} className="search-cover" src={game.cover ? IGDBImage(game.cover.image_id, "cover_small") : "https://via.placeholder.com/90x128.jpg?text=missing%20cover"} alt={game.name} />
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h5>{game.name}</h5>
                                            <h6 className="text-muted">{category}</h6>
                                            { game.total_rating && <><StarBar percentage={game.total_rating} textual /><br/></> }
                                            <NavLink className="stretched-link" to={`/game/${game.id}/${game.slug}`}></NavLink>
                                        </div>
                                    </div>
                                )
                            }) }
                        </div>
                    </div>
                </div>
            }
                    
            {/* { (!loading && games.length > 0) &&
                games.map((game: Game, index: number) => (
                    <div className="col-sm-6 col-md-4 col-lg-3 col-xl-2 col-6" key={game.slug}>
                        <div className="card shadow mb-4" style={{ cursor: "pointer" }} onClick={() => history.push(`/game/${game.id}/${game.slug}`)}>
                            <img src={game.cover ? IGDBImage(game.cover.image_id, "cover_big") : "https://via.placeholder.com/264x374.jpg?text=missing%20cover"} className="card-img-top search-result-image" alt={game.name} data-bs-toggle="tooltip" data-bs-placement="top" title={game.name} />

                            <div className="py-1 px-2 small fw-bold" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {game.name}
                            </div>
                        </div>
                    </div>
                ))
            } */}

            { (!loading && games.length === 0) &&
                <div className="col-12">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            There are no results for "{queryString}"
                        </div>
                    </div>
                </div>
            }
            </div>
        </div>
    );
}