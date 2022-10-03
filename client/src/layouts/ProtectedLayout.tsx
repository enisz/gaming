import { PropsWithChildren, ReactNode } from "react";
import { SiteHeaderContextProvider } from "../context/SiteHeaderContext";

export default function ProtectedLayout({children}: PropsWithChildren<ReactNode>): JSX.Element {
    return (
        <SiteHeaderContextProvider>
            {children}
        </SiteHeaderContextProvider>
    );
}