import React, { Component } from "react";
import { Row, Col, Container, Button } from "reactstrap";
import { Link } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import arrow from "../../../assets/images/arrow.svg";
import { ReactComponent as ArrowIcon } from "../../../assets/images/arrow.svg";
import { createCashRequest } from "../../../store/actions";
import { AvForm, AvInput } from "availity-reactstrap-validation";
import { connect } from "react-redux";
class CashToCrypto extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: "Krak. Przedm. 16/18 POLAND",
      amount: 0,
      trackingNumber: "",
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };
  handleSubmit = () => {
    const { amount, trackingNumber } = this.state;

    this.props.createCashRequest({ amount, trackingNumber }, (cash) => {
      if (cash) {
        this.setState({ trackingNumber: '', amount: 0 });
      }
    });
  };

  render() {
    return (
      <React.Fragment>
        <div className="page-freeze">
          <Container>
            <AvForm
              className="form-horizontal"
              onValidSubmit={this.handleSubmit}
            >
              <div className="crypto-content">
                <h1 className="crypto-heading m-0">
                  {(this.props.isMobile) && (
                    <Link onClick={this.props.onBack} className="text-muted mbl-back-icon-finance">
                      <i className="ri-arrow-left-line back-arrow"></i>
                    </Link>
                  )}
                  <span className="mx-2">CASH TO CRYPTO</span>
                  {/* <i className="mdi mdi-dots-horizontal"></i> */}
                </h1>
                <div className="main-cash-to-crypto-cls">
                  <Row className="address-cls">
                    <Col lg={12} className="history-d">
                      <p>Address to send cash in your wallet</p>
                    </Col>
                  </Row>
                  <Row className="crypto-input">
                    <Col xl={12}>
                      <hr />
                    </Col>
                    <Col lg={4}>
                      <label className="form-label">Addrees</label>
                    </Col>
                    <Col lg={8}>
                      <span>
                        {this.state.address}
                      </span>
                    </Col>
                    <Col xl={12}>
                      <hr />
                    </Col>
                  </Row>
                  <Row className="shipment">
                    <Col xl={12}>
                      <p>
                        Please send your payment using a service with tracking number,
                        so you can track the shipment. Resonance does not accept
                        responsibility for lost shipments.
                        <b> Cost of cash to crypto is 12%.</b>
                      </p>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={12}>
                      <div className="detail-form">
                        <label className="form-label-cls">Tracking number</label>
                        <AvInput
                          name="trackingNumber"
                          value={this.state.trackingNumber}
                          onChange={this.handleChange}
                          type="text"
                          className="form-control form-text-cls"
                          id="name"
                          placeholder="e.g. 32326356724673"
                          validate={{
                            required: { value: true, errorMessage: "Please enter tracking number." },
                          }}
                        />
                      </div>
                      <div className="detail-form">
                        <label className="form-label-cls">Amount</label>
                        <AvInput
                          name="amount"
                          value={this.state.amount}
                          onChange={this.handleChange}
                          type="number"
                          className="form-control form-text-cls"
                          id="amount"
                          placeholder="0.00"
                          validate={{
                            required: { value: true, errorMessage: "Please enter amount." },
                          }}
                        />
                      </div>
                      <div className="note-cash">
                        <span className="note-cls">Please note: </span>
                        <span className="cash-in">We accept cash only in USD, EUR, CHF.</span>
                      </div>
                      <div className="text-center">
                        <Button type="submit" className="btn cryto-btn">
                          SEND MAIL
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </AvForm>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = ({ User }) => ({
  user: User.user,
});
const mapDispatchToProps = {
  createCashRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(CashToCrypto);
