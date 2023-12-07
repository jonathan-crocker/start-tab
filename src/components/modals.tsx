import * as React from 'react';
import { ReactNode, forwardRef, useState, useCallback } from 'react';
import { Modal as BsModal } from 'bootstrap'; 

export const useModal = (options?: Partial<BsModal.Options>): [(element: HTMLDivElement) => void, BsModal] => {

    const [modal, setModal] = useState<BsModal>();
    const callback = useCallback((element: HTMLDivElement) => {

        if (element)
            setModal(BsModal.getOrCreateInstance(element, options));
    }, []);

    return [callback, modal as BsModal];
}

interface ModalProps {
    header?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;    
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(({ header, footer, children }, ref) => {

    return (
        <div ref={ref} className="modal fade" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    {header && <div className="modal-header">{header}</div>}
                    {children && <div className="modal-body">{children}</div>}
                    {footer && <div className="modal-footer">{footer}</div>}
                </div>
            </div>
        </div>
    );
});
