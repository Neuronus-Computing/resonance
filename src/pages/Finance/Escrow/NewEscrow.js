import React, { Component } from "react";
import { Row, Col, Container, Button } from "reactstrap";
import { AvForm, AvInput } from "availity-reactstrap-validation";
import arrow from "../../../assets/images/arrow.svg";
import { Link } from "react-router-dom";
import src from "../../../assets/images/create new.png";
import { connect } from "react-redux";
import { createEscrowRequest , getContacts } from "../../../store/actions";
import TermsCondition from "../../../components/model/termsCondition"; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ReactComponent as AddNewIcon } from "../../../assets/images/add-icon.svg";
class NewEscrow extends Component {
  constructor(props) {
    super(props);
    const wallets = props.user?.identity?.wallets || [];
    const contacts = props.contacts || [];
    this.state = {
      showForm: false,
      showModal: false, 
      currency: wallets[0]?.coin?.toUpperCase() || "USD",
      user: props.user || [],
      attachmentError:false,
      contacts,
      form: {
        sellerIdentity: contacts[0]?.address || null,
        amount: "",
        timeline: "1",
        walletId: wallets[0]?.walletId || null,
        attachment: null,
        description: "",
      },
    };
  }
  componentDidMount() {
    const { getContacts } = this.props;
    getContacts();
    console.log(this.state.contacts);
  }
  componentDidUpdate(prevProps, prevState) {
    const { contacts } = this.props;
    if (this.props.contacts !== prevProps.contacts) {
        this.setState({contacts});
    }
  }
  handleDateChange = (date) => {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        date: date,
      },
    }));
  };
  toggleForm = () => {
    this.setState((prevState) => ({
      showForm: !prevState.showForm,
    }));
  };
  handleModalClose = () => {
    this.setState({ showModal: false });
    this.toggleForm();
  };

  handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "walletId") {
      const selectedWallet = this.state.user?.identity?.wallets?.find(
        (wallet) => wallet.walletId === value
      );
      if (selectedWallet) {
        this.setState({
          currency:selectedWallet.coin.toUpperCase() 
        });
      }
    }

    if (name === "attachment") {
      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          attachment: files[0],
        },
      }));
    } else {
      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          [name]: value,
        },
      }));
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({
      showModal: !prevState.showModal,
    }));
  };
  handleCreateEscrow = (e) => {
    e.preventDefault();
    const { createEscrowRequest } = this.props;
    const { form } = this.state;
    createEscrowRequest(form, (newEscrow) => {
      if (newEscrow) {
        this.props.onMenuItemClick(`/finance/escrow-details/${newEscrow.id}`);
      }else{
        this.setState({ showModal: false });
      }
    });
  };

  render() {
    const {user,currency,showModal, attachmentError} = this.state;
    const termsParagraphs = [
      "Please keep a few things in mind:",
      "Escrow Protection is in place for fixed-price jobs. Before you start the project, you and the client must agree to requirements, budget, and milestones. Resonance charges the client at the beginning of the project, and the money for a milestone is deposited in escrow.",
      "Escrow funded payments are released when the client approves work. When milestones are completed, the client can either approve work and release payment or request modifications to the work. Clients can also request that you approve the return of funds held in escrow.",
      "Resonance offers mediation services. If you do the work and the client refuses to pay, Resonance can help mediate the dispute.",
      "Please choose fixed-price jobs carefully. Only funds deposited for an active milestone are covered by Escrow Protection."
    ];
    return (
      <React.Fragment>
        <div className="crypto-content">
          <TermsCondition
            isCancelled={false}
            isOpen={showModal}
            onClose={() => this.setState({ showModal: false })}
            termsParagraphs={termsParagraphs}
            onSubmit={this.handleCreateEscrow} 
            showClose={false}
          />
          {!this.state.showForm ? (
            <h1 className="crypto-heading m-0">
             {(this.props.isMobile) && (
                <Link onClick={this.props.onBack} className="text-muted mbl-back-icon-finance">
                  <i className="ri-arrow-left-line back-arrow"></i>
                </Link>
              )}
              <span className="mx-2">ESCROW</span>
            </h1>
          ) : (
            <h1 className="crypto-heading m-0">
              <i className="ri-arrow-left-line back-arrow" onClick={this.toggleForm}></i>
              <span className="mx-2">ESCROW DETAILS</span>
            </h1>
          )}
          <Container fluid={true} className="step-back new-escrow-cls">
            {!this.state.showForm ? (
              <div className="create-new-cls">
                <div className="text-center">
                  <div className="create-new" onClick={this.toggleForm}>
                    {/* <img src={src} alt="Create New" /> */}
                    <AddNewIcon style={{ color: 'var(--skyblueText) !important',width:50,height:50, }}/>
                    <div className="mt-3">
                      <h3 className="msg-heading">Create New</h3>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Row>
                <Col lg={12}>
                  <AvForm
                    className="form-horizontal"
                    onValidSubmit={this.handleSubmit}
                  >
                    {/* <Row>
                      <Col lg={12} sm={12}>
                      <div className="detail-form">
                        <label className="form-label-cls">Seller Identity</label>
                        <AvInput
                          name="sellerIdentity"
                          value={this.state.form.sellerIdentity}
                          validate={{ required: true }}
                          onChange={this.handleChange}
                          type="text"
                          className="form-control form-text-cls"
                          id="name"
                          placeholder="Id address"
                        />
                      </div>
                      </Col>
                    </Row> */}
                    <Row>
                    <Col lg={12} sm={12}>
                      <div className="detail-form">
                        <label className="form-label-cls">Seller Identity</label>
                        <select
                          name="sellerIdentity"
                          value={this.state.form.sellerIdentity}
                          onChange={this.handleChange}
                          className="form-control form-text-cls"
                          required
                        >
                          {  this.state.contacts.filter(contact => contact.type !== "channel" && contact.type !== "group").length > 0 ? 
                            this.state.contacts
                            .filter((contact) => (contact.type !== "channel" && contact.type !== "group" && contact.name !== "BotAi"))
                            .map((contact) => (
                              <option key={contact.id} value={contact.address}>
                                {contact.name}
                              </option>
                            ))
                            : 
                            <option value=''>
                              No contact found.
                            </option>
                          }
                        </select>
                      </div>
                    </Col>
                    </Row>
                    <Row>
                      <Col lg={6} sm={12}>
                      <div className="detail-form">
                        <label className="form-label-cls">Amount</label>
                        <div className="input-group">
                          <AvInput
                            type="number"
                            className="form-control form-text-cls"
                            name="amount"
                            placeholder="0.00"
                            value={this.state.form.amount}
                            onChange={this.handleChange}
                            validate={{ required: true }}
                          />
                          <div className="input-group-append">{currency}</div>
                        </div>
                      </div>
                      </Col>
                      <Col lg={6} sm={12}>
                      <label className="form-label-cls">Timeline:</label>
                        <select
                          id="timeline-select"
                          className="form-control form-text-cls"
                          value={this.state.form.timeline}
                          onChange={this.handleChange}
                          name="timeline"
                        >
                          <option value="1">1 Day</option>
                          <option value="3">3 Days</option>
                          <option value="7">1 Week</option>
                          <option value="30">1 Month</option>
                        </select>
                      </Col>
                    </Row>
                    <Col lg={12}>
                      <div className="detail-form">
                        <label className="form-label-cls">Wallet</label>
                        <select
                          className="form-control form-text-cls"
                          name="walletId"
                          value={this.state.form.walletId}
                          onChange={this.handleChange}
                          required
                        >
                          {user && user.identity && user.identity.wallets.length > 0
                            ? user.identity.wallets.map((wallet) => (
                                <option key={wallet.id} value={wallet.walletId}>
                                  {wallet.label} {wallet.balance} {wallet.coin.toUpperCase()}
                                </option>
                              ))
                            : 
                            <option value=''>
                              No wallet found.
                            </option>
                          }
                        </select>
                      </div>
                    </Col>
                    <div className="detail-form">
                      <label className="form-label-cls">Attachment</label>
                      <div className="custom-file">
                        <AvInput className={`file-name mr-auto form-control form-text-cls`}
                           value ={this.state.form.attachment
                            ? this.state.form.attachment.name
                            : ""}
                            placeholder="Please select file."
                            name="file-field"
                            readOnly
                            disabled
                        />
                        <label
                          className="custom-file-label"
                          htmlFor="attachment"
                        >
                          Upload File
                          <input
                            type="file"
                            className="custom-file-input"
                            id="attachment"
                            name="attachment"
                            onChange={this.handleChange}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="detail-form">
                      <label className="form-label-cls">Description</label>
                      <AvInput
                        className="form-control form-text-cls"
                        name="description"
                        value={this.state.form.description}
                        onChange={this.handleChange}
                        validate={{ required: true }}
                        type="textarea"
                        placeholder="Subject Here....."
                      />
                    </div>
                    <div className="text-center">
                      <Button
                        type="submit"
                        className="btn cryto-btn"
                      >
                        SENT REQUEST
                      </Button>
                    </div>
                  </AvForm>
                </Col>
              </Row>
            )}
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ User ,chat}) => ({
  user: User.user,
  contacts: chat.chats,
});
const mapDispatchToProps = {
  createEscrowRequest,
  getContacts,
};

export default connect(mapStateToProps, mapDispatchToProps)(NewEscrow);
