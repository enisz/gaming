import { PropsWithChildren, ReactNode } from "react";
import './AuthLayout.scss';

export default function AuthLayout({children}: PropsWithChildren<ReactNode>): JSX.Element {
    return (
        <div className="auth-container">
            {children}
        </div>
    );
}