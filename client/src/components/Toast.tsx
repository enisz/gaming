interface ToastInterface {
    type: "success" | "danger" | "warning" | "info";
    message: string;
}

export default function Toast({type, message}: ToastInterface): JSX.Element {
    let icon: string;

    switch(type) {
        case 'success':
            icon = "fas fa-check-circle";
        break;
        case 'danger':
            icon = "fas fa-exclamation-circle";
        break;
        case 'warning':
            icon = "fas fa-exclamation-triangle";
        break;
        case 'info':
            icon = "fas fa-info-circle";
        break;
    }

    return (
        <div className={`alert alert-${type} d-flex align-items-center mx-0 my-0 shadow`} role="alert">
            <i className={`${icon} fa-fw me-3`}></i>
            <div>
                {message}
            </div>
        </div>
    );
}