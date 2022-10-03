import './Spinner.scss';

export default function Spinner({ label }: { label?: string }): JSX.Element {
    return (
        <div className="spinner-container">
            <div className="sk-chase">
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
            </div>
            <span className="label">{label ? label : "Loading..."}</span>
        </div>
    );
}