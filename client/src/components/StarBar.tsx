import { Tooltip } from 'bootstrap';
import { useRef } from 'react';
import { useEffect } from 'react';

interface StarBarInterface {
    percentage: number;
    starCount?: number;
    textual?: boolean;
    tooltip?: "top" | "right" | "bottom" | "left";
}

export default function StarBar({ percentage, starCount, textual, tooltip }: StarBarInterface): JSX.Element {
    useEffect(() => {
        if(tooltip) {
            new Tooltip((starContainer.current as HTMLDivElement))
        }
    }, [tooltip]);

    const starContainer = useRef<HTMLDivElement>(null);
    const items = starCount || 5;
    const stars: JSX.Element[] = [];
    const value = Math.round(percentage);

    for(let i=0; i<items; i++) {
        const low = i*(100/items);
        const high = i*(100/items) + (100/items);
        let className = "";

        if(value >= high) {
            className = "fas fa-star";
        } else if(value <= low) {
            className = "far fa-star";
        } else {
            className = "fas fa-star-half-alt";
        }

        stars.push(<i key={`star-${i}`} className={`${className} me-2 text-warning`}></i>)
    }

    return (
        <>
            <div ref={starContainer} data-bs-toggle="tooltip" data-bs-placement={tooltip ? tooltip : "right"} title={`${value}%`} className="mb-2" style={{ display: "inline"}}>
                {stars}
            </div>
            
            { textual && <span className="text-white">{`(${value}%)`}</span>}
        </>
    );
}