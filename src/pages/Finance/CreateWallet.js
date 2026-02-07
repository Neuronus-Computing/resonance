import React, { Component } from "react";
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import withRouter from '../../components/Common/withRouter';

import {
  Row,
  Col,
  Card,
  CardBody,
  TabContent,
  TabPane,
  NavItem,
  NavLink,
  Label,
  Form,
  Container,
  Button,
} from "reactstrap";
import { createWalletRequest } from "../../store/actions";
import BTC from "../../assets/images/bitcoin.svg";
import NCN from "../../assets/images/NCN.svg"
import ETH from "../../assets/images/ETH (ethereum).png";
import USDT from "../../assets/images/USDT (tether).png";
import ADA from "../../assets/images/ADA (cardano).png";
import DOGE from "../../assets/images/DOGE (dogecoin).png";
import MATIC from "../../assets/images/MATIC (polygon).png";
import LTC from "../../assets/images/LTC.png";
import { AvForm, AvField} from "availity-reactstrap-validation";
import arrow from "../../assets/images/arrow.svg";
import { Link } from "react-router-dom";
import classnames from "classnames";

class CreateWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 1,
      progressValue: 25,
      selectedCrypto: "",
      label: "",
      showPassword: false,
    };
    this.toggleTab = this.toggleTab.bind(this);
    this.handleCryptoChange = this.handleCryptoChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCreateWallet = this.handleCreateWallet.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({ activeTab: tab });
    }
  }

  togglePasswordVisibility = () => {
    this.setState((prevState) => ({ showPassword: !prevState.showPassword }));
  };

  handleCryptoChange(event) {
    this.setState({ selectedCrypto: event.target.value });
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState({ 
      [name]: value,
     
    });
  }

  handleCreateWallet(event, errors, values) {
    if (errors.length === 0) {
      const { selectedCrypto } = this.state;
      const { label} = values;

      const data = {
        coin: selectedCrypto,
        label,
      };
      this.props.createWalletRequest(data, (success, wallet) => {
        if (success) {
            this.setState({
              activeTab: 3,
              progressValue: 100,
              label: '',
              selectedCrypto:'',
              wallet,
            });
        }
      });
    }
  }

  handleNext() {
    this.setState((prevState) => ({
      activeTab: prevState.activeTab + 1,
      progressValue: 50, 
    }));
  }

  handleBack() {
    this.setState((prevState) => ({
      activeTab: prevState.activeTab - 1,
      progressValue: 25,
    }));
  }

  renderCryptoSelectionForm() {
    const cryptos = [
      { code: "btc", name: "BTC (bitcoin)", imageUrl: BTC },
      { code: "ltc", name: "LTC(LiteCoin)",width:40, imageUrl: LTC },
      { code: "NCN", name: "NCN (Neurocoin)",width:40, imageUrl: NCN },
      // { code: "hteth", name: "ETH (ethereum)", imageUrl: ETH },
      // { code: "usdt", name: "USDT (tether)", imageUrl: USDT },
      // { code: "ADA", name: "ADA (cardano)", imageUrl: ADA },
      // { code: "DOGE", name: "DOGE (dogecoin)", imageUrl: DOGE },
      // { code: "MATIC", name: "MATIC (polygon)", imageUrl: MATIC },
    ];

    return (
      <Form>
        <ul className="list-unstyled chat-list w-100">
          {cryptos.map((crypto) => (
            <li key={crypto.code}>
              <div className="d-flex justify-content-between">
                <Label className="form-check-label d-flex check-box container" htmlFor={`crypto-${crypto.code}`}>
                  <input
                    type="radio"
                    name="crypto"
                    value={crypto.code}
                    id={`crypto-${crypto.code}`}
                    checked={this.state.selectedCrypto === crypto.code}
                    onChange={this.handleCryptoChange}
                  />
                  <span className="checkmark"></span>
                  <img src={crypto.imageUrl} alt={crypto.name} className="crp-img" style={crypto.width ? { width: crypto.width } : {}} />
                  <p>{crypto.name}</p>
                </Label>
              </div>
              <hr className="crypto-hr" />
            </li>
          ))}
        </ul>
        <div className="bottom-card">
          <Button type="button" className="w-md w-100 btn cryto-btn"  onClick={this.handleNext} disabled={!this.state.selectedCrypto}>Next</Button>
        </div>
      </Form>
    );
  }

  renderSecondStep() {
    return (
      <AvForm onSubmit={this.handleCreateWallet} className="form-horizontal">
        <Row>
          <Col md={12}>
            <div className="detail-form">
              <Label for="label" className="form-label-cls">Wallet Name</Label>
              <AvField
                name="label"
                id="label"
                value={this.state.label}
                onChange={this.handleInputChange}
                required
                placeholder="Wallet Name"
                className="form-control form-text-cls"
                errorMessage="Please enter a wallet name"
              />
            </div>
          </Col>
        </Row>
        <div className="mt-3">
          {/* <Button type="button" className="bitcoin-BTN m-2 btn btn-secondary btn-sm py-2 px-3" onClick={this.handleBack}>
            Back
          </Button> */}
          <Button type="submit" className="w-md w-100 btn cryto-btn">
            Create Wallet
          </Button>
        </div>
      </AvForm>
    );
  }

  renderCompletedStep() {
    const {wallet} = this.state;
    return (
      <div className="completed-step text-center">
        <h2>Wallet Created Successfully!</h2>
        <p>Your wallet has been created with the selected cryptocurrency.</p>
        {wallet?.slug && (
          <Link className="w-md btn cryto-btn my-5" to={`/finance/wallet/${wallet?.slug || ""}`}>
            View Wallet
          </Link>
        )}
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className="crypto-content">
          <h1 className="crypto-heading m-0">
            {(this.props.isMobile) && (
              <Link onClick={this.props.onBack} className="text-muted mbl-back-icon-finance">
                <img src={arrow} alt="Arrow" />
              </Link>
            )}
            <span>Choose Crypto</span>
          </h1>
          <Container fluid={true} className="step-back margin-cls">
            <Row>
              <Col lg="12">
                <div id="basic-pills-wizard" className="twitter-bs-wizard">
                  <ul className="twitter-bs-wizard-nav nav nav-pills nav-justified">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === 1, "previous-class": this.state.activeTab > 1, })}
                        onClick={() => this.toggleTab(1)}
                      >
                        <span className="step-number">01</span>
                        <span className="step-title">Select Coin</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === 2,"previous-class": this.state.activeTab > 2 })}
                        onClick={() => this.state.activeTab >= 2 && this.toggleTab(2)}
                        disabled={this.state.activeTab < 2}
                      >
                        <span className="step-number">02</span>
                        <span className="step-title">Wallet Details</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === 3 })}
                        onClick={() => this.state.activeTab >= 3 && this.toggleTab(3)}
                        disabled={this.state.activeTab < 3} // Disable if previous step is not completed
                      >
                        <span className="step-number">03</span>
                        <span className="step-title">Completed</span>
                      </NavLink>
                    </NavItem>
                  </ul>
                </div>
              </Col>
            </Row>
          </Container>
          <Container fluid={true} className="step-back main-walet">
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <TabContent activeTab={this.state.activeTab} className="main-finance-wallet">
                      <TabPane tabId={1}>
                        {this.renderCryptoSelectionForm()}
                      </TabPane>
                      <TabPane tabId={2}>
                        {this.renderSecondStep()}
                      </TabPane>
                      <TabPane tabId={3}>
                        {this.renderCompletedStep()}
                      </TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

CreateWallet.propTypes = {
  user: PropTypes.object,
};

const mapStateToProps = ({ User, wallet }) => ({
  user: User.user,
});

const mapDispatchToProps = (dispatch) => ({
  createWalletRequest: (walletData,callback)=>dispatch(createWalletRequest(walletData, callback)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateWallet));
