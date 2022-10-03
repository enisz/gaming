import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { createContext, FunctionComponent } from "react";

export interface ThemeContextInterface {
    setTheme: (theme: string) => void;
    getTheme: () => string;
}

const ThemeContext = createContext<ThemeContextInterface>({ setTheme: () => {}, getTheme: () => { return "";} });
export default ThemeContext;

export const ThemeContextProvider: FunctionComponent = ({ children }): JSX.Element => {
    const [currentTheme, setCurrentTheme] = useState<string>(sessionStorage.getItem("site-theme") || localStorage.getItem("site-theme") || "default");

    const contextValue = useRef<ThemeContextInterface>({
        setTheme: (theme: string) => setCurrentTheme(theme),
        getTheme: (): string => currentTheme
    });

    useEffect(() => {
        sessionStorage.setItem("site-theme", currentTheme);

        const url = `${process.env.PUBLIC_URL}/css/bootstrap/${currentTheme}.bootstrap.min.css`;
        const link = document.querySelector("link[title=site-theme]");
        link?.setAttribute("href", url);
    }, [currentTheme])

    return (
        <ThemeContext.Provider value={contextValue.current}>
            {children}
        </ThemeContext.Provider>
    );
}