export default function Pager(): JSX.Element {
    return (
        <div className="d-flex flex-row justify-content-between">
            <div className="btn-toolbar" role="toolbar">
                <div className="btn-group me-2" role="group" aria-label="First group">
                    <button type="button" className="btn btn-secondary">1</button>
                    <button type="button" className="btn btn-secondary">2</button>
                    <button type="button" className="btn btn-secondary">3</button>
                    <button type="button" className="btn btn-primary">4</button>
                </div>
                <div className="btn-group me-2" role="group" aria-label="Second group">
                    <button type="button" className="btn btn-primary">5</button>
                    <button type="button" className="btn btn-secondary">6</button>
                    <button type="button" className="btn btn-success">7</button>
                    <button type="button" className="btn btn-danger">8</button>
                    <button type="button" className="btn btn-warning">9</button>
                    <button type="button" className="btn btn-info">10</button>
                    <button type="button" className="btn btn-light">11</button>
                    <button type="button" className="btn btn-dark">12</button>
                </div>
                <div className="btn-group" role="group" aria-label="Third group">
                    <button type="button" className="btn btn-info">13</button>
                </div>
            </div>

            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown">
                    10
                </button>

                <ul className="dropdown-menu dropdown-menu-end">
                    {[10,25,50].map((item: number, index: number) => <li key={`pager-${index}`}><a className="dropdown-item" href="#">{item}</a></li>) }
                </ul>
            </div>
        </div>
    );
}