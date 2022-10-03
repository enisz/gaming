import { createContext, useState, useEffect, useCallback, FormEvent, FunctionComponent } from "react";
import useUserContext from "../hooks/useUserContext";
import './SiteHeaderContext.scss';
import useSearch from "../hooks/useSearch";
import { NavLink } from "react-router-dom";
import { useRef, MouseEvent } from "react";

export interface useSiteHeaderContextInterface {
    setBg: (src?: string) => void;
    setSize: (height?: number) => void;
    setOverlay: (padding?: number) => void;
    setPreset: (presetName: "loading" | "default" | "gameView") => void;
}

interface Preset {
    [key: string]: {
        size: number;
        overlay: number;
    }
}

const defaultBg = "/img/bg.jpg";
const defaultSize = 300;
const defaultOverlay = 150;
const SiteHeaderContext = createContext<useSiteHeaderContextInterface>({ setBg: () => {}, setSize: () => {}, setOverlay: () => {}, setPreset: () => {}});
const transparencyOverlay = 70;
const presets: Preset = {
    default: {
        overlay: defaultOverlay,
        size: defaultSize
    },

    loading: {
        overlay: 70,
        size: 250
    },

    gameView: {
        overlay: 200,
        size: 450
    }
};
export default SiteHeaderContext;

export const SiteHeaderContextProvider: FunctionComponent = ({children}): JSX.Element => {
    const [bg, setBg] = useState<string>(defaultBg)
    const [size, setSize] = useState<number>(defaultSize);
    const [overlay, setOverlay] = useState<number>(defaultOverlay);
    const { logout, user } = useUserContext();

    const { handleSearch, searchTerm, setSearchTerm } = useSearch();

    const scrollListener = useCallback(
        (): void => {
            const y = window.scrollY;
            const nav = document.getElementById("mynav");

            if(nav === null) return;

            if(y > transparencyOverlay) {
                nav.classList.add("bg-primary", "shadow");
                nav.classList.remove("bg-transparent");
            } else {
                nav.classList.add("bg-transparent");
                nav.classList.remove("bg-primary", "shadow");
            }
        }, []
    );

    useEffect(
        () => {
            window.addEventListener("scroll", scrollListener);

            return () => window.removeEventListener("scroll", scrollListener);
        }, [scrollListener]
    );

    const contextValue = useRef<useSiteHeaderContextInterface>({
        setBg: (src?: string): void => setBg(src || defaultBg),
        setSize: (height?: number): void => setSize(height !== undefined ? height : defaultSize),
        setOverlay: (padding?: number): void => setOverlay(padding !== undefined ? padding : defaultOverlay),
        setPreset: (presetName: "loading" | "default" | "gameView") => {
            contextValue.current.setSize(presets[presetName].size);
            contextValue.current.setOverlay(presets[presetName].overlay);
        }
    });

    const handleToggler = (event: MouseEvent<HTMLButtonElement>) => {
        const toggler = event.currentTarget
        const collapsed = toggler.classList.contains("collapsed");
        const nav = document.getElementById("mynav");
        const y = window.scrollY;

        if(collapsed) {
            if(y > transparencyOverlay) {
                nav?.classList.add("bg-primary");
                nav?.classList.remove("bg-transparent");
            } else {
                nav?.classList.add("bg-transparent");
                nav?.classList.remove("bg-primary");
            }
        } else {
            nav?.classList.add("bg-primary");
            nav?.classList.remove("bg-transparent");
        }
    }

    return(
        <SiteHeaderContext.Provider value={contextValue.current}>
            <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-transparent border-bottom-0" id="mynav" style={{ transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                <div className="container">
                    <NavLink className="navbar-brand" to="/home">Navbar</NavLink>
                    <button onClick={handleToggler} className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink to="/home" className="nav-link">Home</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/users" className="nav-link">Users</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/marketplace" className="nav-link">Marketplace</NavLink>
                            </li>
                        </ul>

                        {
                            <form className="d-flex ms-auto me-3" onSubmit={handleSearch}>
                                <div className="input-group">
                                    <input type="text" className="form-control" placeholder="keresés..." onChange={(event: FormEvent<HTMLInputElement>) => setSearchTerm(event.currentTarget.value)} value={searchTerm} />
                                    <button className="btn btn-primary" type="submit" id="button-addon2">
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                            </form>
                        }

                        <ul className="navbar-nav">
                            <li className="nav-item dropdown">
                                <button className="nav-link btn btn-link" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img alt="Avatar" src="/img/avatar.png" className="avatar" />
                                </button>

                                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="navbarDropdown">
                                    <li><h6 className="dropdown-header">{user.unm}</h6></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><NavLink className="dropdown-item" to={`/users/${encodeURIComponent(user.unm)}`}><i className="fas fa-user-circle fa-fw me-2"></i> My Profile</NavLink></li>
                                    <li><NavLink className="dropdown-item" to="/settings"><i className="fas fa-sliders-h fa-fw me-2"></i> Settings</NavLink></li>
                                    <li><NavLink className="dropdown-item" to="/messages"><i className="fas fa-envelope-open-text fa-fw me-2"></i> Messages</NavLink></li>
                                    <li><NavLink className="dropdown-item" to="/collection"><i className="fas fa-book-reader fa-fw me-2"></i> My Collection</NavLink></li>
                                    <li><NavLink className="dropdown-item" to="/wishlist"><i className="far fa-meh-rolling-eyes fa-fw me-2"></i> My Wishlist</NavLink></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item" onClick={logout}><i className="fas fa-sign-out-alt fa-fw me-2"></i> Logout</button></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="site-header" style={{ backgroundImage: `url('${bg}')`, height: `${size}px`, marginBottom: `${overlay === 0 ? 0 : overlay * -1}px`}}>
                <div className="overlay"></div>
            </div>

            <div className="site-content">
                {children}
            </div>
        </SiteHeaderContext.Provider>
    );
}