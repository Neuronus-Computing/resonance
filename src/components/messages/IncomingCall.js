import React, { useContext } from "react";
import { CallContext } from "../../routes/call";
import { Modal, ModalBody } from "reactstrap";

const IncomingCallModal = () => {
    const { showIncomingCallModal, caller, answerCall, leaveCall } = useContext(CallContext);

    return (
        <Modal isOpen={showIncomingCallModal} className="modal-dialog-centered modal-sm">
            <div className="bg-modal">
                <ModalBody className="custom-modal-body text-center">
                    <h3>Incoming Call</h3>
                    {caller && (
                        <>
                            <img 
                                src={caller.avatar || "/default-avatar.png"} // Default avatar fallback
                                className="rounded-circle" 
                                style={{ height: '130px', width: '130px', objectFit: 'cover' }} 
                                alt={caller.name || "Caller Avatar"} 
                            />
                            <p>{caller.name || "Unknown Caller"}</p>
                        </>
                    )}
                    <span 
                        className="p-2 mx-2 rounded-circle bg-success text-white" 
                        role="button" 
                        style={{ cursor: "pointer" }} 
                        onClick={answerCall}
                    >
                        <i className="mdi mdi-phone"></i>
                    </span>
                    <span 
                        className="p-2 rounded-circle bg-danger text-white" 
                        role="button" 
                        style={{ cursor: "pointer" }} 
                        onClick={leaveCall}
                    >
                        <i className="mdi mdi-phone"></i>
                    </span>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default IncomingCallModal;
