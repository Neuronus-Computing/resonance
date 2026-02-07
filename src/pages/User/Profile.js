import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Label, Input, Collapse, Modal, ModalHeader, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane, Button } from "reactstrap";
import user2 from "../../assets/images/user-img.png";
import user3 from "../../assets/images/circle.png";
import user5 from "../../assets/images/plus.png";
import { Link } from "react-router-dom";
import Select from "react-select";
import withRouter from '../../components/Common/withRouter';
import { logoutRequest,deleteAccountRequest,changeAvatar, updateNickname,fetchIdentity, createContact} from '../../store/actions';
import { toast } from "react-toastify";
import { Tooltip } from 'react-tooltip';
import QrScanner from 'react-qr-scanner'; 
const storageSize = [
  {
    options: [
      { label: "200 Mb", value: "200" },
      { label: "1 GB", value: "1" },
      { label: "10 Gb", value: "10" },
      { label: "100 Gb", value: "100" },
    ],
  },
];

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user || {},
      storage_size: 200,
      dangerouseArenaState: false,
      viewSeedState: false,
      showCollapse: false,
      selectedFile: null,
      imageURL: null,
      qrCodeModalOpen: false,
      activeTab: '1',
      scannedData: null,  
      scanning: true,     
      nickname: props.user?.identity?.nickname || "", 
      lastScanned: null,
      isMobile: window.innerWidth <= 800,
    };

    // Create a ref for file input element
    this.fileInputRef = createRef();
    this.qrCodeRef = createRef(); 
    this.handleStorageSize = this.handleStorageSize.bind(this);
    this.openDangerousArena = this.openDangerousArena.bind(this);
    this.openSeed = this.openSeed.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
    this.handleNicknameChange = this.handleNicknameChange.bind(this);
    this.handleUpdateNickname = this.handleUpdateNickname.bind(this);
    this.handleCreateContact = this.handleCreateContact.bind(this);
  }
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }
  handleResize = () => {
    this.setState({ isMobile: window.innerWidth <= 800 });
  };
  handleNicknameChange(event) {
    let value =event.target.value;
    const regex = /^[a-zA-Z0-9-_]*$/;
    if (regex.test(value) || value === "") {
      this.setState({ nickname:value });
    }
    else{
      toast.error("Only letters, numbers, hyphens, and underscores are allowed.");
    }
  }

  handleUpdateNickname(event) {
    event.preventDefault();
    const { nickname } = this.state;
    if (!nickname.trim()) {
      toast.error("Nickname cannot be empty.");
      return;
    }
    this.props.updateNickname(nickname.trim() ,(nickname)=> {
      this.setState({ 
        nickname: nickname,
      });
      this.setState((prevState) => ({
        user: {
          ...prevState.user,
          nickname: nickname,
        }}));
    });
  }

  async handleLogout(event, values) {
    event.preventDefault();
    this.setState({ loading: true });
    setTimeout(() => {
      this.props.logoutRequest(this.props.router.navigate);
  }, [1000]);
    this.setState({ loading: false, registrationError: null });
  }

  async handleDeleteAccount(event, values) {
    event.preventDefault();
    this.setState({ loading: true });
    setTimeout(() => {
      this.props.deleteAccountRequest(this.props.router.navigate);
  }, [1000]);
    this.setState({ loading: false, registrationError: null });
  }
  handleChange = (event) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      user: {
        ...prevState.user,
        identity: value,
      },
    }));
  };

  handleStorageSize = (storage_size) => {
    this.setState({ storage_size });
  };

  openDangerousArena() {
    this.setState({ dangerouseArenaState: !this.state.dangerouseArenaState });
  }

  openSeed() {
    this.setState({ viewSeedState: !this.state.viewSeedState });
  }

  toggleCollapse = () => {
    this.setState((prevState) => ({
      showCollapse: !prevState.showCollapse,
    }));
  };
  // Function to handle file selection
  handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png"];

      // Check for allowed file types
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error("Invalid file type. Please select a JPG, JPEG, or PNG file.");
        return;
      }

      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      img.onload = () => {
        if (img.width >= 50 && img.width <= 500 && img.height >= 50 && img.height <= 500) {
          this.setState({
            selectedFile: file,
            imageURL: URL.createObjectURL(file),
          });
          this.props.changeAvatar(file);
        } else {
          toast.error("Avatar dimensions must be between 50x50 and 500x500 pixels.");
        }
      };

      reader.readAsDataURL(file);
    }
  };
  // Function to open file dialog
  openFileDialog = () => {
    this.fileInputRef.current.click();
  };
  handleCopy = (field , value) => {
    navigator.clipboard.writeText(value).then(
      () => {
        toast.success(`${field} copied successfully.`);
      },
      (err) => {
        toast.error(`Could not copy ${field}: `, err);
      }
    );
  };
  toggleQRCodeModal = () => {
    this.clearScannedData();
    this.setState({ qrCodeModalOpen: !this.state.qrCodeModalOpen });
  };
  toggleTab = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({ activeTab: tab });
    }
  };
  downloadQRCode = async () => {
    const { user } = this.state;
    const qrCodeUrl = user.identity.qrCode;
  
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.identity.address || 'QRCode'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); 
      setTimeout(() => {
        toast.success('QR code downloaded successfully.');
      }, 1000);
    } catch (error) {
      toast.error('Error in download QR code, please try again.');
    }
  };
  renderQRCodeModal = () => {
    const { user,scannedData,isMobile } = this.state;
    return (
      <Modal isOpen={this.state.qrCodeModalOpen} toggle={this.toggleQRCodeModal} className="modal-dialog-centered">
        <div className="bg-modal">
          <ModalHeader className="modal-header-custom pb-1"> 
            <h2>QR Code and scanner</h2>
          </ModalHeader>
          <ModalBody className="custom-modal-body">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={this.state.activeTab === '1' ? 'active' : ''}
                  onClick={() => this.toggleTab('1')}
                >
                  My Code
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={this.state.activeTab === '2' ? 'active' : ''}
                  onClick={() => this.toggleTab('2')}
                >
                  Scan Code
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
              <div className="text-center">
                <div style={{ position: 'relative', display: 'inline-block' }} > 
                    <img src={user.identity.qrCode} alt="QR code" className="w-100" />
                </div>
                  <p className="mt-3">
                    Your QR code is private. If you share it with someone, they can scan it with their Resonance camera to add you as contact. 
                  </p>
                  <Button className="btn cryto-btn savebtn w-100 mt-2" onClick={this.downloadQRCode}>
                    Download QR Code
                  </Button>
                  <Button className="btn w-100 reject-btn mt-2" onClick={this.toggleQRCodeModal}>
                      Close
                  </Button>
                </div>
              </TabPane>
              <TabPane tabId="2">
                {scannedData ? (
                    <div>
                      <div className="text-center">
                      <img
                          src={scannedData.avatar ? scannedData.avatar : ""}
                          alt={scannedData.address}
                          className="rounded-circle w-50 h-50 member-ava"
                        />
                      </div>  
                      <h5>Name: {scannedData.nickname ?? "N/A"}</h5>
                      <p>Address: {scannedData.address ?? "N/A" }</p>
                      <Button className="btn w-100 cryto-btn savebtn mt-2" onClick={this.clearScannedData}>
                        Scan Again
                      </Button>
                      <Button className="btn w-100 cryto-btn savebtn mt-2" onClick={this.handleCreateContact}>
                        Add to contact
                      </Button>
                    </div>
                  ) : (
                    <div className="qr-scanner-wrapper">
                      <QrScanner
                        delay={300}
                        onError={this.handleError}
                        onScan={this.handleScan}
                        style={{ width: "100%" }}
                        facingMode={isMobile ? 'rear' : 'front'}
                      />
                      <div className="scanner-overlay">
                        <div className="top-blur" />
                        <div className="middle-row">
                          <div className="left-blur" />
                          <div className="center-clear" />
                          <div className="right-blur" />
                        </div>
                        <div className="bottom-blur" />
                      </div>
                      <p className="text-center">Scan a Resonance QR code.</p>
                    </div>
                  )} 
                  <Button className="btn w-100 reject-btn mt-2" onClick={this.toggleQRCodeModal}>
                    Close
                  </Button>
              </TabPane>
            </TabContent>
          </ModalBody>
        </div>
      </Modal>
    );
  };

  toggleScannerModal = () => {
    this.setState({ scannerModalOpen: !this.state.scannerModalOpen });
  };
  handleScan = (data) => {
    if (data && this.state.scanning) {
      if (data.text.startsWith("R-")) {
        if (!this.state.lastScanned || this.state.lastScanned !== data.text) {
          this.setState({ lastScanned: data.text });
            this.props.fetchIdentity(data.text,null,(identity) => {
            this.setState({
              scannedData: identity,
              scanning: false,   
              lastScanned: null,
            });
          });
        }
      } else {
        if (!this.state.lastScanned || this.state.lastScanned !== data.text) {
          // toast.error("Invalid QR code. Please scan a valid Resonance QR code.");
          this.setState({
            lastScanned: data.text, 
            scanning: false,
          });
  
          setTimeout(() => {
            this.setState({
              lastScanned: null,
              scanning: true, 
            });
          }, 500);
        }
      }
    }
  };  
  handleCreateContact(){
  const { nickname, address } = this.state.scannedData;

  this.props.createContact({
    name: nickname ? nickname : address,
    address: address,
  },() => {
    // this.setState({
    //   scannedData: null,
    //   scanning: true 
    // });
  });
}
  clearScannedData = () => {
    this.setState({
      scannedData: null,  
      scanning: true, 
      lastScanned: null,
    });
  };
  handleError = (err) => {
    console.log('Error scanning QR code. Please try again.');
  };
  render() {
    const { user, storage_size, dangerouseArenaState, viewSeedState, imageURL, nickname } = this.state;
    const avatarURL = user.identity.avatar ? user.identity.avatar : imageURL || user2;
    let divStyle = {
      height: '130px',
      width: '130px',
      backgroundImage: `url(${avatarURL})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      cursor: 'pointer',
    };

    if (window.matchMedia("(max-width:435px)").matches) {
      divStyle = {
        ...divStyle,
        height: '124px',
        width: '124px',
      };
    }

    let divStyle1 = {
      height: '110px',
      width: '110px',
      backgroundImage: `url(${user3})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      // cursor: 'pointer',
    };

    if (window.matchMedia("(max-width:435px)").matches) {
      divStyle1 = {
        ...divStyle1,
       display:'none',
      };
    }

    return (
      <React.Fragment>
        <div className="page-content page-profile">
          <div className="d-lg-flex chat-side">
            <div className="w-100 user-chat-cls mt-sm-0">
              <div className="px-lg-2">
                <div className="d-flex justify-content-center align-items-center">
                  <div className="profile-w main-prfile">
                    <div className="chat-conversation p-3 chat-conversation-height">
                        <div className="d-flex justify-content-center id-img">
                          <div className="second-img rounded-circle" 
                            style={divStyle} 
                            onClick={this.openFileDialog} 
                            data-tooltip-id="avatar-tooltip" 
                            data-tooltip-content="Change profile image."
                          >
                            {/* {!imageURL  && <img src={user2} alt="" className="camera-img" />} */}
                          </div>
                          <Tooltip id="avatar-tooltip" />
                          <input
                            type="file"
                            ref={this.fileInputRef}
                            style={{ display: "none" }}
                            onChange={this.handleFileChange}
                            accept=".jpg,.jpeg,.png"
                          />
                          <div style={divStyle1} aria-disabled className="mt-2">
                            <img src={user5} alt="" className="plus-img" />
                          </div>
                        </div>
                        <div className="text-center id-mar">
                          <h2 className="id-color">
                            <div className="identity-container justify-content-center">
                              {user.identity.address.substring(0, 8)}..
                              <i 
                                  className="ri-qr-code-fill pointer"
                                  onClick={this.toggleQRCodeModal}  
                                  data-tooltip-id="qr-code-tooltip"
                                  data-tooltip-content="Show QR code."
                                ></i>
                                {this.renderQRCodeModal()}
                            </div>
                          </h2>
                          <Tooltip id="qr-code-tooltip" />
                        </div>
                        <div className="id-mar">
                          <Label className="form-label id-color">Identity Nickname</Label>
                          <div className="input-with-icon id-input">
                            <Input
                              type="text"
                              className="form-control"
                              id="nickname"
                              value={nickname}
                              onChange={this.handleNicknameChange}
                              placeholder="Enter your nickname"
                            />
                            <i className="ri-save-line input-icon pointer" 
                              data-tooltip-id="id-name-tooltip" 
                              data-tooltip-content="Save identity nickname."
                              onClick={this.handleUpdateNickname}
                            ></i>
                            <Tooltip id="id-name-tooltip" />
                          </div>
                        </div>
                        <div className="id-mar">
                          <Label className="form-label id-color">Identity address</Label>
                          <div className="input-with-icon id-input">
                            <Input
                              type="text"
                              className="form-control"
                              value={user.identity.address}
                              readOnly
                            />
                            <i className="ri-file-copy-line input-icon pointer" 
                              data-tooltip-id="id-name-tooltip" 
                              data-tooltip-content="Copy identity address."
                              onClick={() =>
                                this.handleCopy("address", user.identity.address)
                              }
                            ></i>
                            <Tooltip id="id-name-tooltip" />
                          </div>
                        </div>
                        <div className="id-mar">
                          <Label className="form-label id-color">Share Via Code/QR/link</Label>
                          <div className="input-with-icon id-input">
                            <Input
                              type="text"
                              className="form-control custom-placeholder"
                              placeholder="Paste code/QR/link here..."
                              value={user.identity.qrCode}
                              readOnly
                            />
                            <i className="ri-qr-scan-2-line input-icon" 
                                onClick={() =>
                                this.handleCopy("QR code link", user.identity.qrCode)}
                                data-tooltip-id="id-name-tooltip" 
                                data-tooltip-content="Copy QR code link."
                              >
                            </i>
                          </div>
                        </div>
                        <hr className="info-hr" />
                        <form action="#" onSubmit={(e) => e.preventDefault()}>
                          <div className="id-mar Arena-cls more-cls">
                            <Link
                              to="#"
                              onClick={this.openDangerousArena}
                              style={{ cursor: "pointer" }}
                              className="btn btn-link text-decoration-none id-color-cls Dangerous "
                            >
                              <span> Dangerous Arena</span>
                              <i className={`ri-arrow-${dangerouseArenaState ? 'down' : 'right'}-s-line`} ></i>
                            </Link>
                            <Collapse isOpen={this.state.dangerouseArenaState}>
                              <hr className="del-hr" />
                              <div>
                                <button type="button" className="btn btn-link text-danger" onClick={this.handleDeleteAccount}>
                                    Delete Account
                                </button>
                              </div>
                            </Collapse>
                          </div>
                        </form>
                        <div className="id-mar Arena-cls more-cls">
                          <Link to="#" onClick={this.openSeed} style={{ cursor: "pointer" }} className="btn btn-link id-color-cls Dangerous">
                            <span>View my seeds</span>
                            <i className={`ri-arrow-${viewSeedState ? 'down' : 'right'}-s-line`}></i>
                          </Link>
                          
                          <Collapse isOpen={this.state.viewSeedState}>
                          <hr className="seed-show"/>
                            <div>
                              <textarea
                                className="form-control show-seed"
                                value={this.state.user.seed}
                                readOnly
                                rows="1"
                                style={{ overflow: 'auto' }} 
                              />
                            </div>
                          </Collapse>
                        </div>
                        <form action="#" onSubmit={(e) => e.preventDefault()}>
                          <div className="id-mar Arena-cls">
                            <button className="btn text-danger w-100 text-left" onClick={this.handleLogout}>
                                Log out
                            </button>
                          </div>
                        </form>
                        {/* <hr className="id-hr" />
                        <div className="id-mar">
                          <div className="id-mar manger-pd">
                            <Label className="form-label id-color">Space Manager</Label>
                            <Select
                              value={storage_size}
                              onChange={this.handleStorageSize}
                              options={storageSize[0].options}
                              classNamePrefix="select2-selection"
                              styles={{
                                dropdownIndicator: (provided) => ({
                                  ...provided,
                                  color: '#1877f2',
                                  borderRadius: '20px',
                                }),
                                menu: (provided) => ({
                                  ...provided,
                                  maxHeight: '150px',
                                  backgroundColor: 'var(--pastelblue)',
                                  border: '1px solid #ccc',
                                   borderRadius: '20px'
                                }),
                                menuList: (provided) => ({
                                  ...provided,
                                  maxHeight: '150px',
                                  overflowY: 'auto',
                                  padding:'0px'
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  backgroundColor: state.isSelected ? '#1877f2' : state.isFocused ? '#1877f2' : provided.backgroundColor,
                                  color: state.isSelected ? '#fff' : state.isFocused ? '#fff' : provided.color,
                                   borderRadius: '20px',
                                  '&:hover': {
                                    backgroundColor: '#1877f2',
                                    color: '#fff',
                                     borderRadius: '20px'
                                  },
                                }),
                              }}
                            />
                          </div>
                        </div> */}
                        <hr />
                        
                        <Link to="/settings/menu-management" className="btn cryto-btn savebtn w-100 mt-2">
                        <span>Go to menu settings</span>
                        <i className={`ri-arrow-right"}-s-line`} />
                      </Link>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Profile.propTypes = {
  user: PropTypes.object,
};
const mapStateToProps = ({User}) => ({
  user: User.user,
});

const mapDispatchToProps ={
  logoutRequest,deleteAccountRequest,changeAvatar,updateNickname,fetchIdentity,createContact
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
