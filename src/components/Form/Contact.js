import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label } from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import user1 from "../../assets/images/user-img.png";

const ContactModal = ({ isOpen, toggle, title, members = [], contacts, onSubmit }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    if (isOpen) {
      setSelectedContacts(members.map((member) => member.identityId) || []);
      setSearchTerm("");
    }
  }, [isOpen, members]);

  const handleCheckboxChange = (address) => {
    setSelectedContacts((prevSelected) =>
      prevSelected.includes(address)
        ? prevSelected.filter((addr) => addr !== address)
        : [...prevSelected, address]
    );
  };

  const handleFormSubmit = (event, values) => {
    event.preventDefault();
    onSubmit(selectedContacts, values);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredContacts = useMemo(() => {
    const memberAddresses = members.map((member) => member.identityId);

    return contacts
      .filter((contact) => contact.type === "contact")
      .filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((contact) => !memberAddresses.includes(contact.address));
  }, [contacts, searchTerm, members]);

  const allContactsAdded = filteredContacts.length === 0;

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered">
      <div className="bg-modal">
        <ModalHeader className="modal-header-custom pb-1">
          <h2>{title}</h2>
        </ModalHeader>
        <ModalBody className="custom-modal-body">
          <AvForm className="form-horizontal" onValidSubmit={handleFormSubmit}>
            {/* Search Input */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control search-contact"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="contacts-list">
              {allContactsAdded ? (
                <p className="text-center">All contacts are added to the channel.</p>
              ) : filteredContacts.length === 0 ? (
                <p className="text-center">No contact found.</p>
              ) : (
                filteredContacts.map((contact, index) => (
                  <div
                    key={contact.id}
                    className={`contact-item ${
                      index === filteredContacts.length - 1 ? "last-contact" : ""}
                      ${selectedContacts.includes(contact.address) ? "selected-contact" : ""}`}
                    
                    style={{
                      borderLeft: selectedContacts.includes(contact.address)
                        ? "3px solid"
                        : "none",
                      // backgroundColor: selectedContacts.includes(contact.address)
                      //   ? "#e6f0ff"
                      //   : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => handleCheckboxChange(contact.address)}
                  >
                    <Label className="d-flex align-items-center">
                      <img
                        src={contact.avatar ? contact.avatar : user1}
                        alt={contact.name}
                        className="rounded-circle avatar-sm member-ava"
                      />
                      <span className="contact-name">
                        {contact.name.length > 16
                          ? `${contact.name.substring(0, 13)}...`
                          : contact.name}
                      </span>
                    </Label>
                  </div>
                ))
              )}
            </div>

            <ModalFooter>
              <Button className="btn reject-btn" onClick={toggle}>
                Cancel
              </Button>
              <Button
                className="btn cryto-btn savebtn"
                type="submit"
                disabled={selectedContacts.length === 0}
              >
                Save
              </Button>
            </ModalFooter>
          </AvForm>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default ContactModal;
