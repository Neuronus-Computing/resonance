import React, { Component } from "react";
import {Alert, Row, Col, Container, Button, Card, CardBody, Modal, ModalHeader, ModalBody, ModalFooter, Label } from "reactstrap";
import { Link } from "react-router-dom";
import arrow from "../../../assets/images/arrow.svg";
import cancel from "../../../assets/images/cancel.png";
import withRouter from "../../../components/Common/withRouter";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { escrowStatusUpdateRequest,clearMessage ,createDisputeRequest,cencelRequest} from "../../../store/actions";
import TermsCondition from "../../../components/model/termsCondition"; 
import BTC from "../../../assets/images/bitcoin.svg";
import ETH from "../../../assets/images/ETH (ethereum).png";
import USDT from "../../../assets/images/USDT (tether).png";
import ADA from "../../../assets/images/ADA (cardano).png";
import DOGE from "../../../assets/images/DOGE (dogecoin).png";
import MATIC from "../../../assets/images/MATIC (polygon).png";
import LTC from "../../../assets/images/LTC.png";
class EscrowDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user || [],
      showTerms: true,
      escrow: [],
      timeLeft: null,
      showAttachModal: false,
      selectedFile: null,
      filename:'',
      sellerWallet: props.user.identity.wallets[0].address ?? null,
      status: '',
      isCancelled:false,
      confirmInfo:'',
      showError:false,
      showDisputeModal: false, 
      disputeReason: '',
      disputeFile: null,
      confirmDispute:false,
      showPaymentModal: false, 
      recipient: '',
      selectedWallet: '',
      showError: false, 
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.timerInterval = null;
  }
  componentDidMount() {
    const { user } = this.props;
    const currentEscrowId = this.props.router.location.pathname.split("/").pop();
    if (currentEscrowId) {
      const escrowData = user?.identity?.escrows?.find((escrow) => escrow.id == currentEscrowId);
      if (escrowData) {
        const status = escrowData.status === "rejected" ? true : false;
        const cancelled = escrowData.status === "rejected"  && escrowData.buyerIdentity === user.identity.address? true : false;
        this.setState(
          {
            escrow: escrowData,
            isCancelled: cancelled,
            showTerms: status,
            showError: !escrowData.errorMessage && escrowData.buyerIdentity === user.identity.address,
          },
          () => {
            if (
              escrowData.startTime &&
              escrowData.endTime &&
              !["asked-release", "release", "disputed"].includes(escrowData.status)
            ){
              this.startTimer(escrowData.startTime, escrowData.endTime);
            }
          }
        );
      }
    }
  }
  componentDidUpdate(prevProps) {
    const { user } = this.props;
    const currentEscrowId = this.props.router.location.pathname.split('/').pop();
    const previousEscrowId = prevProps.router.location.pathname.split('/').pop();
    if (currentEscrowId !== previousEscrowId || prevProps.user !== user) {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }
      const escrowData = user?.identity?.escrows?.find((escrow) => escrow.id == currentEscrowId);
      if (escrowData) {
        const cancelled = escrowData.status === "rejected"  && escrowData.buyerIdentity === user.identity.address? true : false;
        const status = escrowData.status === 'rejected' ? true : false;
        this.setState(
          {
            escrow: escrowData,
            isCancelled: cancelled,
            showTerms: status,
            showError: !!escrowData.errorMessage && escrowData.buyerIdentity === user.identity.address,
          },
          () => {
            if (
              escrowData.startTime &&
              escrowData.endTime &&
              !["asked-release", "release", "disputed","resolved"].includes(escrowData.status)
            ){
              this.startTimer(escrowData.startTime, escrowData.endTime);
            }
          }
        );
      }
    }
  }
  startTimer = (startTime, endTime) => {
    const end = new Date(endTime).getTime();
    const start = new Date(startTime).getTime();
    let timeLeft = end - Date.now();
    if (timeLeft < 0) timeLeft = 0;
    this.timerInterval = setInterval(() => {
      timeLeft = end - Date.now();
      if (timeLeft <= 0) {
        clearInterval(this.timerInterval);
        timeLeft = 0;
      }
      this.setState({
        timeLeft,
      });
    }, 1000);
  };  
  formatTime = (milliseconds) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24)); 
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24); 
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const seconds = Math.floor((milliseconds / 1000) % 60); 
    return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
  handleAlertClose = async () => {
    const { escrow } = this.state;
    const { clearMessage } = this.props;
    clearMessage(escrow.id, (escrowId) => {
      if (escrowId) {
          this.setState((prevState) => ({
              escrow: {
                  ...prevState.escrow,
                  errorMessage: null, 
              },
              showError: false,
          }));
        }
    });
  };
  downloadFile = async (fileType) => {
    const { escrow } = this.state;
    let fileUrl = "";
    if (fileType === "attachment" ){
      fileUrl =escrow.attachment;
    }
    else if (fileType ==="proofOfWork") {
       fileUrl =escrow.proofOfWork;
    }
    else if (fileType ==="disputeFile") {
      fileUrl =escrow.dispute.disputeFile;
    }
    if (!fileUrl) {
      toast.error("File not available for download.");
      return;
    }
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = fileUrl.split("/").pop();
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Attachment downloaded successfully.");
    } catch (error) {
      toast.error("Error downloading file, please try again.");
    }
  };
  handleUnderstandClick = () => {
    this.setState({ showTerms: false });
  };
  toggleAttachModal = () => {
    this.setState({
      showAttachModal: !this.state.showAttachModal,
      selectedFile:null,
      filename:""
    });
  };
  handleFileChange = (event) => {
    this.setState({ 
      selectedFile: null,
      filename: ''
    });
    const { name, value, files } = event.target;
    if (files) {
      this.setState({ 
        selectedFile: files[0],
        filename: files[0].name
      });
    }
  };
  handleDisputeSubmit = () => {
    const { escrow, disputeReason,selectedFile } = this.state;
    const { address } = this.state.user.identity;
    const { createDisputeRequest } = this.props;
    if (!escrow) return;
    createDisputeRequest(escrow.id,address,disputeReason,selectedFile,(escrowId) => {
      if (escrowId) {
        this.props.onMenuItemClick(`/finance/freezed-escrow/${escrowId}`);
        this.setState({ showDisputeModal: false, selectedFile: null, fileName: null,disputeReason:'' });    
      }}
    );
  };
  handleAskForReleaseSubmit = () => {
    if (!this.state.selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }
    const { escrow, selectedFile } = this.state;
    const { escrowStatusUpdateRequest } = this.props;
    if (!escrow) return;
    escrowStatusUpdateRequest(escrow.id, "asked-release" ,selectedFile, this.state.filename, this.state.sellerWallet, (escrowId,status) => {
      if (escrowId && status) {
        this.props.onMenuItemClick(`/finance/freezed-escrow/${escrowId}`);
        toast.success("Release request submitted successfully.");
        this.setState({ showAttachModal: false, selectedFile: null });    
      }}
    );
  };
  handleReleaseSubmit = () => {
    const { escrow } = this.state;
    const { escrowStatusUpdateRequest } = this.props;
    if (!escrow) return;
    escrowStatusUpdateRequest(escrow.id, "released" ,null, null, null, (escrowId,status) => {
      if (escrowId && status) {
        toast.success("Escrow Released successfully.");
        this.props.onMenuItemClick(`/finance/freezed-escrow/${escrowId}`);
      }}
    );
  };
  handleInputChange(event) {
    const { name, value } = event.target;
    if (name === "sellerWallet") {
      const selectedWallet = this.state.user?.identity?.wallets?.find(
        (wallet) => wallet.address === value
      );
      if (selectedWallet) {
        this.setState({
          sellerWallet:value 
        });
      }
    }
    else{
      this.setState({ 
        [name]: value,
       
      });
    }
  };
  convertMinutesToTime = (totalMinutes , inDays=false) => {
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const seconds = 0; 
    if(inDays){
      return `${String(days).padStart(2, "0")} ${days > 1 ? "Days" : "Day"}`;
    }
    else{
      return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`; 
    }
  }; 
  toggleDisputeModal = () => {
    this.setState(prevState => ({
      showDisputeModal: !prevState.showDisputeModal,
    }));
  };
  handleAcceptCancel = (e) => {
    e.preventDefault();
    const { escrow } = this.state;
    const { cencelRequest } = this.props;
    if (!escrow) return;
    cencelRequest(escrow.id,(escrowId) => {
      if (escrowId) {
        this.handleUnderstandClick();
      }
    });
  };
  togglePaymentModal = () => {
    this.setState(prevState => ({
      showPaymentModal: !prevState.showPaymentModal,
    }));
  };
  handlePaymentChoice = (choice) => {
    const { escrow } = this.state;
    this.setState({
      recipient: choice,
      selectedWallet: choice==="seller" ? escrow.sellerWallet : '',
    });
  };
  handleWalletInputChange = (e) => {
    this.setState({ selectedWallet: e.target.value });
  };
  handleResolveSubmit = () => {
    const { escrow, recipient, selectedWallet } = this.state;
    const { escrowStatusUpdateRequest } = this.props;
    if (!escrow || !recipient) {
      this.setState({ showError: true });
      return;
    }
    escrowStatusUpdateRequest(escrow.id,"resolved",null,null,selectedWallet,recipient, (escrowId, status) => {if (escrowId && status) {
        this.setState({
          showPaymentModal: false,
          recipient: '',
          selectedWallet: '',
        });
        this.props.onMenuItemClick(`/finance/freezed-escrow/${escrowId}`);
      }
    });
  };

  render() {
    const blockchainImages = {
      bitcoin: BTC, 
      etherium: ETH,
      USDT: USDT,
      ADA: ADA, 
      DOGE: DOGE,
      MATIC: MATIC, 
      litecoin:LTC
    };
    const { escrow, user, timeLeft , showAttachModal,isCancelled, showTerms,sallerWallet,confirmInfo,showError,confirmDispute,showPaymentModal, recipient, selectedWallet } = this.state;
    const blockchainImage = blockchainImages[escrow.blockchain] || BTC;
    const buyer = escrow?.buyer || {};
    const seller = escrow?.seller || {};
    return (
      <React.Fragment>
        <div className="page-freeze">
          {Object.keys(escrow).length > 0 ? (
            <>
              {isCancelled && !escrow.isCancelled && (
                <TermsCondition
                isCancelled={isCancelled}
                showClose={false}
                isOpen={showTerms}
                onClose={this.handleAcceptCancel}
                />
              )}
              {escrow.status === "pending" ? (
                <Container>
                  <Row className="">
                    <div className="cancel-point">
                      <div className="">
                        <Card>
                          <CardBody className="cancel-cls">
                            <p>
                              <img src={cancel} alt="cancel" />
                            </p>
                            <h2>Escrow is in pending.</h2>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  </Row>
                </Container>
              ) : (
                <Container>
                  <div className="crypto-content">
                    <h1 className="crypto-heading m-0">
                      {(this.props.isMobile) && (
                        <Link onClick={this.props.onBack} className="text-muted mbl-back-icon-finance">
                          <img src={arrow} alt="Arrow" />
                        </Link>
                      )}
                      <span className="mx-2">ESCROW</span>
                    </h1>
                  </div>
                  <Row>
                    <Col lg={12}>
                      <div className="frez-cls">
                        <Card className="progrs-timer">
                          <CardBody>
                            <p>{escrow.status==="accepted" ? "IN PROGRESS": escrow.status.toUpperCase()}</p>
                            <h1>
                              {escrow.remainingMinutes !== undefined && escrow.remainingMinutes !== null || (escrow.status=="rejected" || escrow.status== "resolved")
                                ? this.convertMinutesToTime(escrow.remainingMinutes)
                                : timeLeft !== null
                                ? this.formatTime(timeLeft)
                                : "00:00:00:00"}
                            </h1>
                          </CardBody>
                        </Card>
                      </div>
                      <Row>
                        <Col xl={12}>
                          {showError && (
                            <div className="mt-2">
                              <Alert color="danger" isOpen={showError && escrow.errorMessage} toggle={this.handleAlertClose}>
                                {escrow.errorMessage}
                              </Alert>
                            </div>
                          )}
                        </Col>
                        <Col xl={12}>
                          <div className={`escrow-details ${showError ? "showError" : ""}`}>
                          {user.identity.type === "admin" || escrow.buyerIdentity === user.identity.address ? (
                              <>
                                <div className="detail-item">
                                  <span className="label">Seller:</span>
                                  <span className="value">{escrow.sellerIdentity}</span>
                                </div>
                                {user.identity.type === "admin" && (
                                  <div className="detail-item">
                                    <span className="label">Buyer:</span>
                                    <span className="value">{escrow.buyerIdentity}</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="detail-item">
                                <span className="label">Buyer:</span>
                                <span className="value">{escrow.buyerIdentity}</span>
                              </div>
                            )}                         
                            <div className="detail-item">
                              <span className="label">Date:</span>
                              <span className="value">
                                {new Date(escrow.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Time Duration:</span>
                              <span className="value">{this.convertMinutesToTime(escrow.timeDuration,true)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Type:</span>
                              <span className="value">{escrow.blockchain}
                                <img src={blockchainImage} alt={escrow.blockchain} />
                              </span>
                            </div>
                            <div className="detail-item pb-1">
                              <span className="label">Service Fee:</span>
                              <span className="value">3%</span>
                            </div>
                            {escrow.attachment && (
                              <div className="detail-item pb-1">
                                <span className="label">Attachments:</span>
                                <Button className="download-btn" size="sm" onClick={() => this.downloadFile("attachment")}>
                                  <span>Download Attachment</span> <i className="fa fa-download"></i>
                                </Button>
                              </div>
                            )}
                            <div className="detail-item pb-0">
                              <span className="label">Description:</span>
                            </div>
                            <div className="detail-item">
                              <span className="discription-cls">{escrow.description}</span>
                            </div>
                            {escrow.proofOfWork && (
                              <div className="detail-item pb-1">
                                <span className="label">Proof Of Work:</span>
                                <Button className="download-btn" size="sm" onClick={() => this.downloadFile("proofOfWork")}>
                                  <span>Download Proof of Work</span>
                                  <i className="fa fa-download"></i>
                                </Button>
                              </div>
                            )}
                            {(escrow.status === "disputed" || escrow.status === "resolved")&& escrow.dispute && Object.keys(escrow.dispute).length > 0 && (
                              <>
                                <div className="detail-item mt-3">
                                  <span className="label amount-cls">Disputed</span>
                                  <span className="value amount-cls">
                                  </span>
                                </div>
                                <div className="detail-item pb-0">
                                <span className="label">Dispute Reason:</span>
                                </div>
                                <div className="detail-item">
                                  <span className="discription-cls">{escrow.dispute?.reason}</span>
                                </div>
                                {escrow.dispute.disputeFile && (
                                  <div className="detail-item pb-1">
                                    <span className="label">Proof Of Dispute:</span>
                                    <Button className="download-btn" size="sm" onClick={() => this.downloadFile("disputeFile")}>
                                      Download Proof of dispute
                                      <i className="fa fa-download"></i>
                                    </Button>
                                  </div>
                                )}
                                {escrow.dispute.paymentReceiver && (
                                  <>
                                  <div className="detail-item mt-3">
                                    <span className="label amount-cls">Resolved Dispute</span>
                                    <span className="value amount-cls">
                                    </span>
                                  </div>
                                  <div className="detail-item pb-1">
                                    <span className="label">Payment sent to:</span>
                                    <span className="value">{escrow.dispute.paymentReceiver}</span>
                                  </div>
                                  </>
                                )}
                              </>
                            )}
                            <div className="detail-item mt-3 main-amount-cls">
                              <span className="label amount-cls">Amount:</span>
                              <span className="value amount-cls amount-value">
                                {escrow.amount} {escrow.coin.toUpperCase()}
                              </span>
                            </div>
                            {!isCancelled && (
                              <div className="actions-cls text-center">
                                {escrow.status !=="released"  && (
                                <>
                                   {escrow.sellerIdentity === user.identity.address &&
                                      escrow.status !== "disputed" &&
                                      escrow.status !== "rejected" &&
                                      escrow.status !== "resolved" ? (
                                      <>
                                      <Button className="me-2 reject-btn" onClick={this.toggleDisputeModal}>
                                        DISPUTE
                                      </Button>
                                      {escrow.sellerIdentity === user.identity.address && !escrow.proofOfWork  && (
                                        <Button className="btn cryto-btn"  onClick={this.toggleAttachModal}>
                                        ASK FOR RELEASE
                                      </Button>
                                      )}
                                    </>
                                  ) : (
                                      <>
                                      {escrow.buyerIdentity === user.identity.address && escrow.status !== "disputed" && escrow.status !== "resolved" && (
                                        <Button className="me-2 reject-btn" onClick={this.toggleDisputeModal}>
                                          DISPUTE
                                        </Button>
                                      )}
                                      {escrow.buyerIdentity === user.identity.address && escrow.status ==="asked-release" && (
                                        <>
                                        <Button className="btn cryto-btn" onClick={this.handleReleaseSubmit}>
                                          RELEASE
                                        </Button>
                                        </>
                                      )}
                                      </>
                                  )}
                                  </>
                                )}
                                 {user.identity.type === "admin" && escrow.status !== "resolved" && (
                                    <>
                                    <Button className="btn cryto-btn" onClick={this.togglePaymentModal}>
                                      Resolve
                                    </Button>
                                    </>
                                  )}
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Modal isOpen={showAttachModal} toggle={this.toggleAttachModal} className="modal-dialog-centered">
                    <div className="bg-modal">
                      <ModalHeader className="modal-header-custom" toggle={this.toggleAttachModal}>
                          <h2>Attach File for Release</h2>
                      </ModalHeader>   
                      <AvForm className="form-horizontal"  onValidSubmit={this.handleAskForReleaseSubmit}>
                        <ModalBody className="bg-cls-txt">
                          <Label htmlFor="attachment" className="form-label-cls">Choose File</Label>
                          <AvField
                            type="file"
                            name="attachment"
                            id="attachment"
                            validate={{
                              required: { value: true, errorMessage: "Please select a file to upload." },
                            }}
                            onChange={this.handleFileChange}
                          />
                          <Label htmlFor="sellerWallet" className="form-label-cls">
                            Your Wallet To Receive Payment ({escrow.coin})
                          </Label>
                          <AvField
                            type="select"
                            name="sellerWallet"
                            id="sellerWallet"
                            value={sallerWallet}
                            onChange={this.handleInputChange}
                            validate={{
                              required: { value: true, errorMessage: "Please select a wallet address." },
                            }}
                          >
                            <option value="" disabled>
                              Select Wallet
                            </option>
                            {user && user.identity && user.identity.wallets
                              ? user.identity.wallets.map((wallet) => (
                                <option key={wallet.id} value={wallet.address}>
                                  {wallet.label} {wallet.balance} {wallet.coin.toUpperCase()}
                                </option>
                              ))
                              : null}
                          </AvField>
                          <div className="d-flex">
                            <AvField
                              type="checkbox"
                              name="confirmInfo"
                              id="confirmInfo"
                              value={confirmInfo}
                              onChange={this.handleInputChange}
                              label="I confirm that the provided information is correct."
                              validate={{
                                required: { value: true, errorMessage: "You must confirm the information before submitting." },
                              }}
                            />
                            <span className="mx-2">I confirm that the provided information is correct.</span>
                          </div>
                        </ModalBody>
                        <ModalFooter>
                          <Button className="cryto-btn savebtn" type="submit">
                            Submit
                          </Button>{" "}
                          <Button className="reject-btn" onClick={this.toggleAttachModal}>
                            Cancel
                          </Button>
                        </ModalFooter>
                      </AvForm>
                    </div>
                  </Modal>
                </Container>
              )}
            </>
          ) : (
            <Container>
              <Row className="">
                <div className="cancel-point">
                  <div className="">
                    <Card>
                      <CardBody className="cancel-cls">
                        <p>
                          <img src={cancel} alt="cancel" />
                        </p>
                        <h2>Escrow not found.</h2>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </Row>
            </Container>
          )}
          <Modal isOpen={this.state.showDisputeModal} toggle={this.toggleDisputeModal} className="modal-dialog-centered">
            <div className="bg-modal">
              <ModalHeader className="modal-header-custom" toggle={this.toggleDisputeModal}>
              <h2>Dispute Escrow</h2>
              </ModalHeader>
              <ModalBody>
                <AvForm onValidSubmit={this.handleDisputeSubmit}>
                  <Label htmlFor="disputeReason" className="form-label-cls">
                    Reason for Dispute
                  </Label>
                  <AvField
                    type="textarea"
                    name="disputeReason"
                    label=""
                    id="disputeReason"
                    value={this.state.disputeReason}
                    onChange={this.handleInputChange}
                    validate={{
                      required: { value: true, errorMessage: "Dispute reason is required." },
                    }}
                  />
                  <Label htmlFor="disputeReasonFile" className="form-label-cls">
                    Attach Proof File
                  </Label>
                  <AvField
                    type="file"
                    name="attachmentssss"
                    id="disputeReasonFile"
                    label=""
                    onChange={this.handleFileChange}
                  />
                  <div className="d-flex">
                      <AvField
                        type="checkbox"
                        name="confirmDispute"
                        id="confirmDispute"
                        value={confirmDispute}
                        onChange={this.handleInputChange}
                        label="You must confirm the information before submitting."
                        validate={{
                          required: { value: true, errorMessage: "You must sure before submitting." },
                        }}
                      />
                      <span className="mx-2">Are you sure, You want to raise dispute for this escrow.</span>
                    </div>
                  <ModalFooter>
                    <Button className="cryto-btn savebtn" type="submit">
                      Submit
                    </Button>{" "}
                    <Button className="reject-btn" onClick={this.toggleDisputeModal}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </AvForm>
              </ModalBody>
              </div>
          </Modal>
          <Modal isOpen={showPaymentModal} toggle={this.togglePaymentModal} className="modal-dialog-centered">
          <div className="bg-modal">
          <ModalHeader className="modal-header-custom" toggle={this.togglePaymentModal}><h2>Choose Payment Recipient</h2></ModalHeader>
           <AvForm onValidSubmit={this.handleResolveSubmit}>
              <ModalBody className="bg-cls-txt">
                <div>
                <Label>Select Recipient:</Label>
                  <AvField
                    type="select"
                    name="recipient"
                    id="recipient"
                    value={recipient}
                    onChange={(e) => { this.handlePaymentChoice(e.target.value) }}
                    validate={{
                      required: { value: true, errorMessage: "Please select payment recipient." },
                    }}
                  >
                    <option value="" disabled>Select Recipient</option>
                    <option value="seller">Seller</option>
                    <option value="buyer">Buyer</option>
                  </AvField>
                </div>
                
                {recipient == "seller" && (
                  <div>
                    <Label>Wallet Address:</Label>
                    <AvField
                    type="text"
                    name="selectedWallet"
                    value={selectedWallet}
                    onChange={this.handleWalletInputChange}
                    placeholder="Enter seller wallet address"
                    validate={{
                      required: { value: true, errorMessage: "Please enter seller wallet address." },
                    }}
                  >
                  </AvField>
                </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button className="cryto-btn savebtn" type="submit">
                  Resolve
                </Button>
                <Button className="reject-btn" onClick={this.togglePaymentModal}>Cancel</Button>
              </ModalFooter>
            </AvForm>
          </div>
        </Modal>

        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ User }) => ({
  user: User.user,
});

const mapDispatchToProps = {
  escrowStatusUpdateRequest,clearMessage,createDisputeRequest,cencelRequest
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EscrowDetails));
