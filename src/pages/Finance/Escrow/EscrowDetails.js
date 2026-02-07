import React, { Component } from "react";
import {Alert, Row, Col, Container, Button, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import arrow from "../../../assets/images/arrow.svg";
import withRouter from "../../../components/Common/withRouter";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import cancel from "../../../assets/images/cancel.png";
import BTC from "../../../assets/images/bitcoin.svg";
import ETH from "../../../assets/images/ETH (ethereum).png";
import USDT from "../../../assets/images/USDT (tether).png";
import ADA from "../../../assets/images/ADA (cardano).png";
import DOGE from "../../../assets/images/DOGE (dogecoin).png";
import MATIC from "../../../assets/images/MATIC (polygon).png";
import LTC from "../../../assets/images/LTC.png";
import { escrowStatusUpdateRequest,changePreloader,acceptTermsRequest,clearMessage } from "../../../store/actions";
import TermsCondition from "../../../components/model/termsCondition"; 

class EscrowDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTerms: false,
      escrow: [],
      showError:false,
    };
  }
  componentDidMount() {
    const { user } = this.props;
    const currentEscrowId = this.props.router.location.pathname.split("/").pop();
    if (currentEscrowId) {
      const escrowData = user?.identity?.escrows?.find((escrow) => escrow.id == currentEscrowId);
      if(escrowData){
        const status = !escrowData.sellerAgreedTerm && escrowData.sellerIdentity === user.identity.address ? true : false;
        this.setState({
          escrow: escrowData,
          showTerms: status,
          showError: !escrowData.errorMessage && escrowData.buyerIdentity === user.identity.address,
        });
      }
    }
  }
  componentDidUpdate(prevProps) {
    const { user } = this.props;
    const currentEscrowId = this.props.router.location.pathname.split("/").pop();
    const previousEscrowId = prevProps.router.location.pathname.split("/").pop();
    
    if (currentEscrowId !== previousEscrowId || prevProps.user !== user) {
      const escrowData = user?.identity?.escrows?.find((escrow) => escrow.id == currentEscrowId);
      if(escrowData){
        const status = !escrowData.sellerAgreedTerm && escrowData.sellerIdentity === user.identity.address ? true : false;
        this.setState({
          escrow: escrowData,
          showTerms: status,
          showError: !!escrowData.errorMessage && escrowData.buyerIdentity === user.identity.address,
        });
      }
    }
  }
  handleUnderstandClick = () => {
    this.setState({ showTerms: false });
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
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onMenuItemClick("/finance/freezed-escrow");
  };
  handleAcceptCondition = (e) => {
    e.preventDefault();
    const { escrow } = this.state;
    const { acceptTermsRequest } = this.props;
    if (!escrow) return;
    this.props.changePreloader(true);
    acceptTermsRequest(escrow.id,(escrowId) => {
      if (escrowId) {
        this.handleUnderstandClick();
      }
      setTimeout (() => {
        this.props.changePreloader(false);
      },5000);
    });
  };
  downloadAttachment = async () => {
    const { escrow } = this.state;
    const attachmentUrl = escrow.attachment;
    try {
      const response = await fetch(attachmentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = attachmentUrl.split('/').pop();
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); 
      setTimeout(() => {
        toast.success('Attachment downloaded successfully.');
      }, 1000);
    } catch (error) {
      toast.error('Error in download Attachment, please try again.');
    }
  };  
  handleEscrowUpdate = (status) => {
    const { escrow } = this.state;
    const { escrowStatusUpdateRequest } = this.props;
    if (!escrow) return;
    escrowStatusUpdateRequest(escrow.id, status,null,null,null,(escrowId,status) => {
      if (escrowId && status) {
          this.props.onMenuItemClick(`/finance/freezed-escrow/${escrowId}`);
      }  
     });
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
      return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;    }
  }; 
  render() {
    const { escrow,showTerms,showError } = this.state;
    const {user} = this.props;
    const blockchainImages = {
      bitcoin: BTC, 
      etherium: ETH,
      USDT: USDT,
      ADA: ADA, 
      DOGE: DOGE,
      MATIC: MATIC, 
      litecoin:LTC
    };
    const blockchainImage = blockchainImages[escrow.blockchain] || BTC;
    const termsParagraphs = [
      "Please keep a few things in mind:",
      "Escrow Protection is in place for fixed-price jobs. Before you start the project, you and the client must agree to requirements, budget, and milestones. Resonance charges the client at the beginning of the project, and the money for a milestone is deposited in escrow.",
      "Escrow funded payments are released when the client approves work. When milestones are completed, the client can either approve work and release payment or request modifications to the work. Clients can also request that you approve the return of funds held in escrow.",
      "Resonance offers mediation services. If you do the work and the client refuses to pay, Resonance can help mediate the dispute.",
      "Please choose fixed-price jobs carefully. Only funds deposited for an active milestone are covered by Escrow Protection."
    ];
    return (
      <React.Fragment>
        <div className="page-content p-0">
          {Object.keys(escrow).length > 0 ? 
          <>
              <TermsCondition
                isCancelled={false}
                showClose={false}
                isOpen={showTerms}
                onClose={() => this.setState({ showTerms: false })}
                termsParagraphs={termsParagraphs}
                onSubmit={this.handleAcceptCondition} 
              />
            
                {escrow.status == "pending" ? (
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
                        <div className={`escrow-details escrow-pending ${showError ? "showError" : ""}`}>
                          {escrow.buyerIdentity === user.identity.address ? <>
                              <div className="detail-item">
                                <span className="label">Seller:</span>
                                <span className="value">{escrow.sellerIdentity}</span>
                              </div>
                              </>:<>
                                <div className="detail-item">
                                  <span className="label">Buyer:</span>
                                  <span className="value">{escrow.buyerIdentity}</span>
                                </div>
                              </>
                            }
                          <div className="detail-item">
                            <span className="label">Date:</span>
                            <span className="value">  {new Date(escrow.date).toLocaleDateString()}
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
                              <Button className="download-btn" size="sm" onClick={this.downloadAttachment}>
                                  <span>Download</span>
                                  <i className="fa fa-download"></i>
                              </Button>
                            </div>
                          )}
                          <div className="detail-item pb-0">
                            <span className="label">Description:</span>
                          </div>
                          <div className="detail-item">
                            <span className="discription-cls">
                            {escrow.description}
                            </span>
                          </div>
                          <div className="detail-item mt-3 main-amount-cls">
                            <span className="label amount-cls">Amount:</span>
                            <span className="value amount-cls amount-value">{escrow.amount} {escrow.coin.toUpperCase()}</span>
                          </div>
                          {escrow.sellerIdentity === user.identity.address && (
                            <div className="actions-cls text-center">
                            <Button className="me-2" onClick={() => this.handleEscrowUpdate('rejected')}>
                                REJECT
                              </Button>
                              <Button className="btn cryto-btn" onClick={() => this.handleEscrowUpdate('accepted')}>
                                ACCEPT
                              </Button>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Container>
                  ):<>
                   <Container>
                    <Row className="">
                      <div className="cancel-point">
                      <div className="">
                        <Card>
                          <CardBody className="cancel-cls">
                            <p>
                            <img src={cancel} alt="cancel"/>
                            </p>
                            <h2>Escrow has been {escrow.status}.</h2>
                          </CardBody>
                        </Card>
                      </div>
                      </div>
                    </Row>
                  </Container>
                </>
                }
            </>:
          <>
            <Container>
              <Row className="">
                <div className="cancel-point">
                <div className="">
                  <Card>
                    <CardBody className="cancel-cls">
                      <p>
                      <img src={cancel} alt="cancel"/>
                      </p>
                      <h2>Escrow not found.</h2>
                    </CardBody>
                  </Card>
                </div>
                </div>
              </Row>
            </Container>
          </>}
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = ({ User }) => ({
  user: User.user,
});

const mapDispatchToProps = {
  escrowStatusUpdateRequest,changePreloader,acceptTermsRequest,clearMessage
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EscrowDetails));

