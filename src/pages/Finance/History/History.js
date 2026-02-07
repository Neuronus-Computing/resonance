import React, { Component } from "react";
import {
  Row,
  Col,
  Container,
  Card,
  CardBody,
  Collapse,
  Button,
  NavItem,
  NavLink,
} from "reactstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import calender from "../../../assets/images/calender.png";
import red from "../../../assets/images/red-arrow.png";
import green from "../../../assets/images/greenarrow.png";
import { fetchTransactionsByDateRange } from "../../../store/actions";
import withRouter from "../../../components/Common/withRouter";
import { connect } from "react-redux";
import moment from "moment";
import arrow from "../../../assets/images/arrow.svg";
import { Link } from "react-router-dom";
import classnames from "classnames";
import { ReactComponent as HistoryIcon } from "../../../assets/images/history-icon.svg";
import { dateFormatByFlags } from "../../../util/dateTime";

class History extends Component {
  constructor(props) {
    super(props);
    const currentDate = new Date();
    this.state = {
      showCalendar: false,
      startDate: currentDate,
      endDate: currentDate,
      collapseStates: {},
      wallets: {}, 
      expandedTransactionId: null, 
    };
  }

  componentDidMount() {
    this.fetchTransactions();
  }
  fetchTransactions = async () => {
    let { startDate, endDate } = this.state;
    let flag=false;
    if (!endDate) {
      endDate = startDate;
      flag=true;
    }
    const adjustedStartDate = new Date(startDate);
    const adjustedEndDate = new Date(endDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    adjustedStartDate.setHours(0, 0, 0, 0); 
    if(flag){
      adjustedEndDate.setHours(23, 59, 59, 999); 
    }
    this.props.fetchTransactionsByDateRange(
      adjustedStartDate,
      adjustedEndDate,
      (wallets) => {
        if (wallets) {
          this.setState({ wallets });
        }
      }
    );
  };  
  handleCalendarClick = () => {
    this.setState((prevState) => ({
      showCalendar: !prevState.showCalendar,
    }));
  };
  handleDateChange = (dates) => {
    const [startDate, endDate] = dates;
    this.setState({ startDate, endDate }, () => {
    const { startDate, endDate } = this.state;
      if (startDate && endDate && startDate.getTime() !== endDate.getTime()) {
        this.fetchTransactions();
        this.setState((prevState) => ({
          showCalendar: !prevState.showCalendar,
        }));      
      } 
    });
  };
  
  toggleCollapse = (walletId) => {
    this.setState((prevState) => ({
      collapseStates: {
        ...prevState.collapseStates,
        [walletId]: !prevState.collapseStates[walletId],
      },
    }));
  };
  toggleDetails = (txId) => {
    this.setState((prevState) => ({
      expandedTransactionId: prevState.expandedTransactionId === txId ? null : txId,
    }));
  };
  render() {
    const { showCalendar, startDate, endDate, collapseStates, wallets,expandedTransactionId } = this.state;
    const walletList = Array.isArray(wallets) ? wallets : Object.values(wallets);
    let settings =this.props.user?.identity?.settings;
    return (
      <React.Fragment>
        <div className="page-freeze">
          <Container className="w-size">
            <div className="crypto-content">
              <h1 className="crypto-heading m-0">
                {(this.props.isMobile) && (
                  <Link onClick={this.props.onBack} className="text-muted mbl-back-icon-finance">
                      <i className="ri-arrow-left-line back-arrow" onClick={this.toggleForm}></i>
                  </Link>
                )}
                <span className="mx-2">HISTORY</span>
              </h1>
              <div className="text-right main-history-div">
              {startDate && (
                <span className="selected-dates-history mx-2">
                  {dateFormatByFlags(
                    startDate,
                    this.props.user?.identity?.settings,
                    true,  
                    false,  
                    false   
                  )}

                  {endDate && startDate.getTime() !== endDate.getTime()
                    ? ` To ${dateFormatByFlags(
                        endDate,
                        this.props.user?.identity?.settings,
                        true,
                        false,
                        false
                      )}`
                    : ""}
                </span>
              )}
              <HistoryIcon style={{ color: 'var(--skyblueText) !important',width:20,height:20, cursor: "pointer" }}       
                onClick={this.handleCalendarClick}
                />
              {showCalendar && (
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={this.handleDateChange}
                  inline
                />
              )}
            </div>
              <Row>
                <Col lg={12}>
                  <div className="main-history-sec">
                    {walletList.length > 0 ? (
                      walletList.map((wallet) => (
                        <Card key={wallet.id} className="mb-3">
                          <CardBody>
                            <Button
                              color="link"
                              onClick={() => this.toggleCollapse(wallet.id)}
                              className="w-100 text-left text-decoration-none no-focus-outline"
                            >
                              <h5 className="mb-0">
                                {wallet.label}{" "}
                                <i
                                  className={`ri-arrow-${
                                    collapseStates[wallet.id] ? "up" : "down"
                                  }-s-line`}
                                ></i>
                              </h5>
                            </Button>
                             <Collapse isOpen={collapseStates[wallet.id]}>
                              <Row>
                                <Col lg={12} className="history-d">
                                  <div className="history-details">
                                    {wallet.transactions && wallet.transactions.length > 0 ? (
                                      wallet.transactions.map((tx) => {
                                        let timeline = [];
                                        if (tx.type === "send") {
                                          timeline = [
                                            "initiated",
                                            "processed",
                                            "broadcasted",
                                            "confirmed"];                                          
                                        } else if (tx.type === "received") {
                                          timeline = [
                                            "detected",
                                            "confirmed"
                                          ];
                                        }
                                        return (
                                          <div key={tx.id}>
                                            <div className="detail-item">
                                              <div className="month-detial">
                                                <div
                                                  className={`${
                                                    tx.type === "send"
                                                      ? "history-arrow"
                                                      : "green-arrow"
                                                  }`}
                                                >
                                                  <img
                                                    src={tx.type === "send" ? red : green}
                                                    alt="Arrow"
                                                  />
                                                </div>
                                                <span className="id-detial">
                                                  <h5
                                                    onClick={() => this.toggleDetails(tx.id)}
                                                    className="pointer"
                                                  >
                                                    {tx.title}
                                                  </h5>
                                                  <p className="secret">{tx.description}</p>
                                                  <p>
                                                    {dateFormatByFlags(
                                                      new Date(tx.timestamp),
                                                      settings,
                                                      true, 
                                                      true,   
                                                      true,  
                                                      true,  
                                                      false,
                                                      settings?.timeFormat
                                                    )}
                                                  </p>
                                                </span>
                                              </div>
                                              <span
                                                className={`${
                                                  tx.type === "send" ? "value" : "value-cls"
                                                }`}
                                              >
                                                {tx.type === "send" ? "-" : "+"}
                                                ${tx.amount}
                                              </span>
                                            </div>
                                            {expandedTransactionId === tx.id && (
                                              <Container fluid={true} className="crypto-content step-back margin-cls">
                                                <h5>Timeline</h5>
                                                <Row>
                                                  <Col lg="12">
                                                    <div id="basic-pills-wizard" className="twitter-bs-wizard">
                                                      <ul className="twitter-bs-wizard-nav nav nav-pills nav-justified step-series">
                                                        {timeline.map((event, index) => (
                                                          <NavItem key={index}>
                                                            <NavLink
                                                              className={classnames({
                                                                active: tx.timeline.includes(event), 
                                                                "text-success": tx.timeline.includes(event),
                                                              })}
                                                              disabled
                                                            >
                                                              <span className="step-number">
                                                                {tx.timeline.includes(event) ? <i className="ri-check-line"></i> : index + 1}
                                                              </span>{" "}
                                                              <p key={index} className="text-success">
                                                                {event.charAt(0).toUpperCase() + event.slice(1)}
                                                              </p>
                                                            </NavLink>
                                                          </NavItem>
                                                        ))}
                                                      </ul>
                                                    </div>
                                                  </Col>
                                                </Row>
                                              </Container>
                                            )}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <p>No transactions found.</p>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                            </Collapse>
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <Card className="mb-3">
                        <CardBody>
                          <Button
                            color="link"
                            className="w-100 text-left text-decoration-none"
                          >
                            <h5 className="mb-0">
                                  No wallet  available.             
                            </h5>
                          </Button>
                          </CardBody>
                      </Card>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
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
  fetchTransactionsByDateRange,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(History));
