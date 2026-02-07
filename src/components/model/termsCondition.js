import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import cancel from "../../assets/images/cancel.png";

const TermsModal = ({ isOpen = null, onClose = null, termsParagraphs = null, onSubmit = null, isCancelled = null, showClose = true }) => {


  return (
    <Modal isOpen={isOpen} className="modal-dialog-centered term-condition-cls">
      <div className="bg-modal">
        <ModalHeader className="text-right">
          {isCancelled ? (
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          ) :
            (<h2>Terms and Conditions </h2>)
          }
        </ModalHeader>
        {isCancelled ? (
          <div className="text-center p-5">
            <p>
              <img src={cancel} alt="cancel" />
            </p>
            <h2>CANCELLED</h2>
          </div>
        ) :
          (
            <>
              <ModalBody>
                {termsParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </ModalBody>
              <ModalFooter className="text-center term-footer">
                <Button className="btn cryto-btn" onClick={onSubmit}>
                  I Understand
                </Button>
                {showClose && (
                  <Button className="reject-btn" onClick={onClose}>
                    Cancel
                  </Button>
                )
                }
              </ModalFooter>
            </>
          )
        }
      </div>
    </Modal>
  );
};

export default TermsModal;
