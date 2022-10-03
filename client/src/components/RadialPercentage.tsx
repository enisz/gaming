import './RadialPercentage.scss';

interface RadialPercentageProps {
    total: number;
    part: number;
}

export default function RadialPercentage({total, part}: RadialPercentageProps): JSX.Element {
    const percentage = Math.round(total / 100 * part);
    return (
        <svg className="gauge" viewBox="0 0 100 100" style={{ width: "50%"}}>
            <circle cx="50" cy="50" r="45" />
            <path fill="none" stroke-linecap="round" stroke-width="5"
                    stroke-dasharray={`${Math.ceil(250.2 * (percentage / 100))} 250.2`}
                    d="M50 10
                    a 40 40 0 0 1 0 80
                    a 40 40 0 0 1 0 -80"/>
            <text x="50" y="50" text-anchor="middle" dy="7" font-size="20">{percentage}%</text>
        </svg>
    );
}