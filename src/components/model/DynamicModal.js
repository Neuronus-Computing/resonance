import React from "react";
import { Modal, Button, ModalBody, ModalHeader } from "reactstrap";

const DynamicModal = ({ show, onClose, title, content }) => {
  return (
    <Modal isOpen={show} onHide={onClose} backdrop="static" keyboard={false} className="modal-dialog-centered">
       <div className="bg-modal">
          <ModalHeader className="modal-header-custom pb-1">
          <h2>{title}</h2>
          </ModalHeader>
          <ModalBody className="custom-modal-body">
             {content}
          </ModalBody>
      </div>
    </Modal>
  );
};

export default DynamicModal;
