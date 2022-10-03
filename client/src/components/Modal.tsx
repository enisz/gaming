import { Modal as BootstrapModal } from 'bootstrap';
import { useRef } from 'react';
import { useEffect } from 'react';

interface ModalButton {
    label: string;
    type: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    action: () => Promise<any>;
}

interface ModalInterface {
    title: string;
    body: JSX.Element;
    buttons: ModalButton[];
    modalOptions?: Partial<BootstrapModal.Options>;
}

export default function Modal(props: ModalInterface): JSX.Element {
    const modalRef = useRef<HTMLDivElement>(null);
    const modal = useRef<BootstrapModal | null>(null);

    useEffect(() => {
        modal.current = new BootstrapModal(modalRef.current as HTMLDivElement, { backdrop: true })
    }, [])

    const handleToggle = () => {
        (modal.current as BootstrapModal).toggle();
    }
    return (
        <>
        <button onClick={handleToggle} type="button" className="btn btn-primary">
  Launch demo modal
</button>
        <div ref={modalRef} className="modal fade" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Modal title</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <p>Modal body text goes here.</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                </div>
                </div>
            </div>
        </div>
        </>
    );
}