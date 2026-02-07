import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, FormFeedback } from "reactstrap";
import { AvForm, AvInput } from "availity-reactstrap-validation";
import { Tooltip } from "react-tooltip";
import user5 from "../../assets/images/user-img.png";
import { ReactComponent as GroupAvatar }  from "../../assets/images/channel-avatar.svg";
import { ReactComponent as ChannelAvatar }  from "../../assets/images/channel-icon.svg";

import { toast } from "react-toastify";

const Form = ({ isOpen, toggle, handleSubmit, fields, handleInputChange, title, hasQrcode, hasSearch, toggleQRCodeModal=null,handleSearchChange=null, saveButton="Save", type=null }) => {
  const [hasErrors, setHasErrors] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); 
  const fileInputRef = useRef(null);
  useEffect(() => {
    const hasValues = fields.some(field => {
      return typeof field.value === 'string' && field.value.trim() !== '';
    });
    setIsDirty(hasValues);
  }, [fields]);
  
  const validateField = (field) => {
    const value = field.value || '';
    let error = null;
    if (field.required && !value) {
      error = `${field.label} is required.`;
    } else if (field.minLength && value.length < field.minLength) {
      error = `Minimum length is ${field.minLength}.`;
    } else if (field.maxLength && value.length > field.maxLength) {
      error = `Maximum length is ${field.maxLength}.`;
    }
    return error;
  };

  const checkForErrors = useCallback(() => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.name === 'avatar') return;
      const error = validateField(field);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    setErrors(newErrors);
    setHasErrors(Object.keys(newErrors).length > 0);
  }, [fields]);

  useEffect(() => {
    if (isOpen) {
      setAvatar(null);
      setFieldTouched({});
    }
  }, [isOpen]);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    const updatedField = fields.find(field => field.name === name);
    updatedField.value = value;
    const error = validateField(updatedField);
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
    setFieldTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));

    setIsDirty(true);
    checkForErrors();
    handleInputChange(e);
  };
  const toggleQRCode =(e) => {
    toggleQRCodeModal();
  }
  const searchChange =(e) => {
    const { name, value } = e.target;
    handleSearchChange(value);
  }

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

const handleSearchIconClick = () => {
  if (searchQuery.trim().length === 0) {
    toast.error("Please Enter a Nickname.");
    return;
  }

  if (handleSearchChange) {
    handleSearchChange(searchQuery);
  }
};

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png"];
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error("Invalid file type. Please select a JPG, JPEG, or PNG file.");
        return;
      }  
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target.result;
      };
      img.onload = () => {
        if (img.width >= 50 && img.width <= 500 && img.height >= 50 && img.height <= 500) {
          handleInputChange(e);
          setAvatar(URL.createObjectURL(file));
        } else {
          toast.error("Avatar dimensions must be between 50x50 and 500x500 pixels.");
        }
      };
      reader.readAsDataURL(file); 
      e.target.value = null;
    }
  };
  

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-dialog-centered">
      <div className="bg-modal">
        <ModalHeader className="modal-header-custom">
          <h2>
            {title} 
            {hasQrcode && (
              <div style={{marginLeft: "30px",float: "right"}}>
                <i
                  className="ri-qr-code-fill pointer"
                  onClick={toggleQRCode}
                  data-tooltip-id="qr-code-tooltip"
                  data-tooltip-content="Scan with QR code."
                  style={{ fontSize: '30px', cursor: 'pointer' }}
                ></i>
                <Tooltip id="qr-code-tooltip" />
              </div>
              )}
          </h2>
        </ModalHeader>
        <ModalBody className="bg-cls-txt">
            {hasSearch && (
              <div className="id-mar">
                <div className="input-with-icon id-input">
                  <input
                    type="text"
                    className="form-control"
                    id="nickname"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Enter Nickname/Address."
                  />
                  <i className="ri-search-line input-icon pointer" 
                    data-tooltip-id="id-name-tooltip" 
                    data-tooltip-content="Search by nickname/address.."
                    onClick={handleSearchIconClick}
                  ></i>
                  <Tooltip id="id-name-tooltip" />
                </div>
              </div>
            )}
          <AvForm className="form-horizontal" onValidSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <div key={index}>
                 {field.name === 'avatar' ? (
                  <div className="d-flex justify-content-center">
                    <div
                      className="second-img rounded-circle"
                      style={{
                        height: '130px',
                        width: '130px',
                        backgroundColor: '#f0f0f0', // Optional: background color
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={openFileDialog}
                      data-tooltip-id="avatar-tooltip"
                      data-tooltip-content="Select avatar."
                    >
                      {avatar ? (
                        <div
                        className="second-img rounded-circle"
                        style={{
                          height: '100%',
                          width: '100%',
                          backgroundImage: `url(${avatar})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          cursor: 'pointer',
                        }}
                        data-tooltip-id="avatar-tooltip"
                        data-tooltip-content="Select avatar."
                      />
                      ) 
                      : (type === "channel" ? (
                        <ChannelAvatar  style={{ color: 'var(--skyblue) !important' }}       
                        />
                      ) : (
                        <GroupAvatar  style={{ color: 'var(--skyblue) !important' }} />
                      ))}
                    </div>
                    <Tooltip id="avatar-tooltip" />
                        <input
                          name={field.name}
                          type="file"
                          className="form-control form-text-cls"
                          id={field.name}
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png"
                        />
                        {errors[field.name] && (
                          <FormFeedback>{errors[field.name]}</FormFeedback>
                        )}
                      </div>
                  )
                 : (
                  <div>
                    <Label for={field.name} className="form-label-cls">{field.label}</Label>
                    <div className="input-with-icon id-input">
                      <AvInput
                        name={field.name}
                        type={field.type}
                        className={`form-control form-text-cls mb-1 ${errors[field.name] && fieldTouched[field.name] ? "is-invalid" : ""}`}
                        id={field.name}
                        placeholder={field.placeholder}
                        onChange={onInputChange}
                        value={field.value || ''}
                        validate={{
                          required: { value: field.required, errorMessage: `${field.label} is required` },
                          ...(field.minLength && { minLength: { value: field.minLength, errorMessage: `Minimum length is ${field.minLength}` } }),
                          ...(field.maxLength && { maxLength: { value: field.maxLength, errorMessage: `Maximum length is ${field.maxLength}` } })
                        }}
                      />
                      {errors[field.name] && fieldTouched[field.name] && (
                        <FormFeedback>{errors[field.name]}</FormFeedback>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <ModalFooter>
              <Button className="btn reject-btn" onClick={toggle}>
                Cancel
              </Button>
              <Button 
                className="btn cryto-btn savebtn" 
                type="submit" 
                disabled={hasErrors || !isDirty} 
              >
                {saveButton}
              </Button>
            </ModalFooter>
          </AvForm>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default Form;
