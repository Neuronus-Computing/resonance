import React, { Component } from "react";
import {
  Row,
  Col,
  Container,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  Input,
  Label,
  ModalHeader
} from "reactstrap";
import arrow from "../../assets/images/arrow.svg";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";
import { connect } from "react-redux";
import { changePreloader } from "../../store/layout/actions";
import { sendMoneyRequest,markAsPrimaryRequest,updateWalletLabelRequest,fetchWalletBySlugRequest, createWalletsRequest } from "../../store/actions";
import { toast } from "react-toastify";
import src from "../../assets/images/create new.png";
import ModelForm from "../../components/Form/Form";
import { Tooltip } from 'react-tooltip';
import BTC from "../../assets/images/bitcoin.svg";
import NCNC from "../../assets/images/NCN.svg"
import ETH from "../../assets/images/ETH (ethereum).png";
import USDT from "../../assets/images/USDT (tether).png";
import ADA from "../../assets/images/ADA (cardano).png";
import DOGE from "../../assets/images/DOGE (dogecoin).png";
import MATIC from "../../assets/images/MATIC (polygon).png";
import LTC from "../../assets/images/LTC.png";
import { ReactComponent as PendingIcon } from "../../assets/images/pending-icon.svg";
import { ReactComponent as AddNewIcon } from "../../assets/images/add-icon.svg";

class Wallet extends Component {
  constructor(props) {
    super(props);
    const colors = {
      light: '#1877f2',
      dark: '#252b3b',
      quantum_violet: '#6818f2',
      barbie: '#FF1493',
      teal: '#1B3D4F',
      neon_ember:"#ff7a00",
      neon:'#0D0D0D'
    };   
    const theme = localStorage.getItem("theme") || "light";  
    this.state = {
      generating:false,
      wallet:
        props.user?.identity?.wallets?.find(
          (wallet) =>
            wallet.slug === props.router.location.pathname.split("/").pop()
        ) || [],
      theme:theme,
      colors:colors,
      selectedTimeframe: "1D",
      series: [{ name: "Price", data: [] }],
      options: {
        chart: { zoom: { enabled: false }, toolbar: { show: false } },
        colors: [colors[theme]],
        dataLabels: { enabled: false },
        stroke: { width: [3], curve: "smooth" },
        xaxis: {
          categories: [], 
          labels: {
            show: true,
            style: {
              colors: "#9aa0ac",
              fontSize: "12px",
            },
          },
          tickAmount: 10, 
        },
        yaxis: {
          labels: {
            show: true,
            formatter: (value) => `$${value.toFixed(2)}`,
            style: {
              colors: "#9aa0ac",
              fontSize: "12px",
            },
          },
          opposite:true,
        },
        tooltip: { y: { formatter: (value) => `$${value}` } },
        grid: { show: false },
      },
      price: "",
      amount: 0,
      receiverAddress: "",
      sendModal: false,
      receiveModal: false,
      labelModal: false,
      errors: [],
      label:'', 
      currentPrice:'',
      percentage:'',
      change:'',
      shouldNavigate:''
    };
    this.toggleSendModal = this.toggleSendModal.bind(this);
    this.toggleLabelModal = this.toggleLabelModal.bind(this);
    this.toggleReceiveModal = this.toggleReceiveModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSendSubmit = this.handleSendSubmit.bind(this);
    this.handleMarkAsPrimary = this.handleMarkAsPrimary.bind(this);
    
}
componentDidMount() {
  const { router, user, fetchWalletBySlugRequest } = this.props;
  const pathParts = router.location.pathname.split("/");
  const slug = pathParts[pathParts.length - 1];

  if (router.location.pathname === "/finance" || slug === "wallet") {
      if (user?.identity?.wallets?.length > 0) {
          const firstWalletSlug = user.identity.wallets[0].slug;
          const wallet = user.identity.wallets[0];
          this.setState({
            wallet,
            label: wallet.label
          });
          this.setState({ shouldNavigate: `/finance/wallet/${firstWalletSlug}` });
      }
  } else {
      fetchWalletBySlugRequest(slug, (wallet) => {
          if (!wallet) return;
          
          this.setState({
              wallet,
              label: wallet.label
          });

          if (wallet.coin !== "NCNC") {
              this.handleTimeframeChange("1D");  
          }
      });
  }
}
componentDidUpdate(prevProps, prevState) {
    const { router, user, fetchWalletBySlugRequest } = this.props;
    const pathParts = router.location.pathname.split("/");
    const slug = pathParts[pathParts.length - 1];

    if (router.location.pathname === "/finance" || slug === "wallet") {
      if (user?.identity?.wallets?.length > 0) {
          const firstWalletSlug = user.identity.wallets[0].slug;
          const wallet = user.identity.wallets[0];
          this.setState({
            wallet,
            label: wallet.label
          });
          this.setState({ shouldNavigate: `/finance/wallet/${firstWalletSlug}` }); // ✅ Save in state first
      }
    }
    if (this.state.shouldNavigate && prevState.shouldNavigate !== this.state.shouldNavigate) {
        this.props.router.navigate(this.state.shouldNavigate);
        this.setState({ shouldNavigate: null });
    }
    const currentSlug= this.props.router.location.pathname.split("/").pop();
    const previousSlug = prevProps.router.location.pathname.split("/").pop();
    if (currentSlug !== previousSlug) {
      const {fetchWalletBySlugRequest} = this.props;
        fetchWalletBySlugRequest(currentSlug,(wallet) => {
          this.setState({
            wallet,
            label:wallet.label
        });
        if (wallet.coin !== "NCNC") {
          this.handleTimeframeChange("1D");
        }
      });
    }
  }
  fetchChartData = async (blockchain, days) => {
    this.props.changePreloader(true);
    const {theme,colors} = this.state;
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${blockchain}/market_chart?vs_currency=usd&days=${days}`
      );
      if (!response.ok) throw new Error(`Error fetching data: ${response.status}`);
      const data = await response.json();
      const groupedData = this.groupData(data.prices, days);
      const startPrice = groupedData.prices[0];
      const currentPrice = groupedData.prices[groupedData.prices.length - 1];
      const priceChange = currentPrice - startPrice;
      const percentage = ((priceChange / startPrice) * 100).toFixed(2);
  
      const isPriceDropped = currentPrice < startPrice;
      const graphColor = isPriceDropped ? "#FF4560" : `${colors[theme]}`;  
      this.setState({
        series: [{ name: "Price", data: groupedData.prices }],
        options: {
          ...this.state.options,
          xaxis: {
            categories: groupedData.timestamps,
            tooltip: {
              x: {
                formatter: (value, { dataPointIndex }) => {
                  const timestamp = groupedData.rawTimestamps[dataPointIndex];
                  if (!timestamp) return "";
                  return new Date(timestamp).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZone: "UTC",
                  });
                },
              },
              y: {
                formatter: (value) => `$${value.toFixed(2)}`,
              },
              theme: "light",
            },
            tickAmount:10,
            labels: {
              show: true,
              rotate: 0,
              style: {
                colors: "#9aa0ac",
                fontSize: "12px",
              },
            },
          },
          yaxis: {
            labels: {
              show: true,
              formatter: this.formatYAxis,
              style: {
                colors: "#9aa0ac",
                fontSize: "12px",
              },
            },
            opposite: true,
            min: Math.min(...groupedData.prices) - 5,
            max: Math.max(...groupedData.prices) + 10,
          },
          tooltip: {
            shared: true,
            intersect: false,
            y: {
              formatter: (value) => `$${value}`, 
            },
            x: {
              formatter: (value, { dataPointIndex }) => {
                const timestamp = groupedData.rawTimestamps[dataPointIndex];
                return new Date(timestamp).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                  timeZone: "UTC",
                });
              },
            },
            theme: "light",
          },
          grid: {
            show: true,
            borderColor: '#e7e7e7',
          },
          colors: [graphColor],
        },
        price: currentPrice.toFixed(2),
        change: priceChange.toFixed(2),
        percentage,
      },
      () => {
        console.log(groupedData);
        this.props.changePreloader(false);
      }
    );
     
    } catch (error) {
      console.log(error); // Log the error object to check its content
      toast.error("Failed to fetch chart data.");
      this.props.changePreloader(false);
    }
  };
  // groupData = (prices, days) => {
  //   const grouped = { prices: [], timestamps: [], rawTimestamps: [] }; 
  //   const currentTime = new Date().getTime();
  //   const timeLimit = currentTime - days * 24 * 60 * 60 * 1000;
  
  //   let interval = 1;
  //   if (days === 1) { 
  //     interval = 60 * 60 * 1000; 
  //   } else if (days === 7) { 
  //     interval = 24 * 60 * 60 * 1000;
  //   } else if (days === 30) { 
  //     interval = 7 * 24 * 60 * 60 * 1000; 
  //   } else if (days === 365) { 
  //     interval = 30 * 24 * 60 * 60 * 1000;
  //   }
  
  //   prices.forEach(([timestamp, price]) => {
  //     if (timestamp >= timeLimit) {
  //       const date = new Date(timestamp);
  //       const formattedDate = this.formatDate(date, interval);
  //       grouped.timestamps.push(formattedDate);
  //       grouped.rawTimestamps.push(timestamp); 
  //       grouped.prices.push(price);
  //     }
  //   });
  
  //   return grouped;
  // };
  groupData = (prices, days) => {
    const grouped = { prices: [], timestamps: [], rawTimestamps: [] };
    let currentTime=null;
    let timeLimit=null;
    let latestTimestamp=null;
    if (prices.length === 0) {
      console.error("No price data available from API.");
      return grouped;
    }
    if(days === 1){
     latestTimestamp = prices[prices.length - 1][0];
     timeLimit = latestTimestamp - (24 * 60 * 60 * 1000); 
    }else{
     currentTime = new Date().getTime();
     timeLimit = currentTime - days * 24 * 60 * 60 * 1000;
    }  
    let interval = 1;
    if (days === 1) { 
      interval = 60 * 60 * 1000; 
    } else if (days === 7) { 
      interval = 24 * 60 * 60 * 1000;
    } else if (days === 30) { 
      interval = 7 * 24 * 60 * 60 * 1000; 
    } else if (days === 365) { 
      interval = 30 * 24 * 60 * 60 * 1000;
    }  
    prices.forEach(([timestamp, price]) => {      
      if (timestamp >= timeLimit) {
        const date = new Date(timestamp);
        const formattedDate = this.formatDate(date, interval);
        grouped.timestamps.push(formattedDate);
        grouped.rawTimestamps.push(timestamp);
        grouped.prices.push(price);
      } 
    });
    return grouped;
  };
  formatYAxis = (value) => {
    if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + "M"; 
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(1) + "k"; 
    } else {
      return value.toFixed(0);
    }
  };
  formatDate = (date, interval) => {
    const options = { timeZone: 'UTC' };
    let formattedDate;

    if (interval === 60 * 60 * 1000) { 
      formattedDate = date.toLocaleTimeString([], { ...options, hour: '2-digit', minute: '2-digit', hour24: true ,});
    } else if (interval === 24 * 60 * 60 * 1000) { 
      formattedDate = date.toLocaleDateString('en-GB', { ...options,  day: '2-digit',month: 'short', year: '2-digit'  }); 
    } else if (interval === 7 * 24 * 60 * 60 * 1000) { 
      formattedDate = date.toLocaleDateString('en-GB', { ...options, day: '2-digit', month: 'short',  year: '2-digit' }); 
    } else if (interval === 30 * 24 * 60 * 60 * 1000) { 
      formattedDate = date.toLocaleDateString('en-GB', { ...options, day: '2-digit',month: 'short', year: '2-digit' }); 
    }
    return formattedDate;
  };

  handleTimeframeChange = (timeframe) => {
    let days;
    switch (timeframe) {
      case "1D":
        days = 1;
        break;
      case "1W":
        days = 7;
        break;
      case "1M":
        days = 30;
        break;
      case "1Y":
        days = 365;
        break;
      case "ALL":
        days = "max";
        break;
      default:
        days = 7;
    }
    this.setState({ selectedTimeframe: timeframe });
    this.fetchChartData(this.state.wallet.blockchain, days);
  };
  toggleSendModal = () => {
    this.setState((prevState) => ({
      sendModal: !prevState.sendModal,
    }));
  };
  toggleLabelModal = () => {
    this.setState((prevState) => ({
      labelModal: !prevState.labelModal,
    }));
  };
  toggleReceiveModal = () => {
    this.setState((prevState) => ({
      receiveModal: !prevState.receiveModal,
    }));
  };
  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value }, () => this.validateField(name, value));
  };
  validateField = (name, value) => {
    let errors = this.state.errors;
    switch (name) {
      case "amount":
        if (!value) {
          errors.amount = "Amount is required.";
        }
        break;
      case "receiverAddress":
        if (!value) {
          errors.receiverAddress = "Receiver address is required.";
        }
        break;
      default:
        break;
    }
    this.setState({ errors });
  };
  handleCopy = (field, value) => {
    navigator.clipboard.writeText(value).then(
      () => {
        toast.success(`${field} copied successfully.`);
      },
      (err) => {
        toast.error(`Could not copy ${field}: `, err);
      }
    );
  };
  createWallet = () => {
    const { createWalletsRequest } = this.props;
    this.setState({generating:true})
    createWalletsRequest(()=>{ this.setState({generating:false})});
  };
  handleSendSubmit = (e) => {
    e.preventDefault();
    const { receiverAddress, amount, wallet } = this.state;
    const {walletId} = wallet;
    const { sendMoneyRequest } = this.props;
    sendMoneyRequest(amount, receiverAddress, walletId,(success) => {
      if(success){
        this.setState((prevState) => ({
          amount:0,
          receiverAddress:'',
        }));
        this.toggleSendModal();
      }
    });
  };
  handleLabelSubmit = (e) => {
    e.preventDefault();
    const { wallet,label } = this.state;
    const { updateWalletLabelRequest } = this.props;
    updateWalletLabelRequest(wallet.walletId,label,() => {
      this.setState((prevState) => ({
        wallet: {
          ...prevState.wallet,
          label: label, 
        },
      }));
      this.toggleLabelModal();
    });
  };
  handleMarkAsPrimary = (e) => {
    e.preventDefault();
    const { walletId } = this.state.wallet;
    const { markAsPrimaryRequest } = this.props;
    markAsPrimaryRequest(walletId,() => {
        this.setState((prevState) => ({
          wallet: {
            ...prevState.wallet,
            isPrimary: !prevState.wallet.isPrimary,
          },
        }));
    });
  };
  downloadQRCode = async () => {
    const { wallet } = this.state;
    const qrCodeUrl = wallet.qrcode;
  
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${wallet.address || 'QRCode'}.png`;
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
  render() {
    const { price, wallet, amount, receiverAddress, sendModal, errors, receiveModal, labelModal, label } = this.state;
    const blockchainImages = {
      bitcoin: BTC, 
      ethereum: ETH,
      USDT: USDT,
      ADA: ADA, 
      DOGE: DOGE,
      MATIC: MATIC, 
      litecoin:LTC,
      neurocoin:NCNC
    };
    const blockchainImage = blockchainImages[wallet.blockchain] || BTC;
    const sendFields = [
      {
        name: "receiverAddress",
        label: "Receiver Wallet Address",
        value: receiverAddress,
        type: "text",
        placeholder: "Enter receiver wallet address.",
        required: true,
      },
      {
        name: "amount",
        label: "Amount",
        value: amount,
        type: "number",
        placeholder: "Enter amount.",
        required: true,
      },
    ];
    const labelFields = [
      {
        name: "label",
        label: "Wallet Label",
        value: label,
        type: "text",
        placeholder: "Enter wallet label.",
        required: true,
      },
    ];
    return (
      <React.Fragment>
        <div className="Bitcoin-content">
          {Object.keys(wallet).length > 0 ? (
            <>
              <Row>
                <Col lg={12}>
                  <h1 className="bitcoin-clr text-center">
                    {(this.props.isMobile) && (
                      <Link onClick={this.props.onBack} className="text-muted mbl-back-icon-finance">
                        <i className="ri-arrow-left-line back-arrow"></i>
                     </Link>
                    )}
                    <span className="mx-2">Your {wallet.blockchain}</span>
                    <ul className="list-inline user-chat-nav chat-dots m-0">
                      <li className="list-inline-item">
                        <Dropdown
                          isOpen={this.state.other2}
                          toggle={() =>
                            this.setState({ other2: !this.state.other2 })
                          }
                        >
                          <DropdownToggle className="btn nav-btn" tag="i">
                            <i className="mdi mdi-dots-horizontal"></i>
                          </DropdownToggle>
                          <DropdownMenu className="dropdown-menu-end">
                            <DropdownItem onClick={this.toggleLabelModal}>
                              <i className="ri-arrow-right-line"></i> Manage
                              name of wallet
                            </DropdownItem>
                            <DropdownItem onClick={this.handleMarkAsPrimary}>
                              <i className="ri-arrow-right-line"></i>{wallet.isPrimary ? "Remove" : "Make"} as primary</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </li>
                    </ul>
                  </h1>
                </Col>
              </Row>
              <Container fluid={true} className="step-back graph-finance">
                <Row>
                  <Col lg={12} className="wallet-main">
                    <img src={blockchainImage} alt={wallet.blockchain} />
                    {wallet.coin !== "NCNC" && (
                      <p className="mt-2 mb-0">Price: ${price}</p>
                    )}
                    <h1 className="my-2 btc-heading">
                      {wallet.balance}{" "}
                      {wallet.coin.toUpperCase()}
                    </h1>
                    {wallet.coin !== "NCNC" && (
                      <p className={this.state.change >= 0 ? "text-green" : "text-red"}>
                        {this.state.change >= 0 ? "+" :''} {this.state.change} ({this.state.percentage}%)
                      </p>
                    )}
                  </Col>
                </Row>
                <Row className="justify-content-center">
                  <Col lg="12">
                    {wallet.coin !== "NCNC" && (
                      <>
                        <ReactApexChart
                          options={this.state.options}
                          series={this.state.series}
                          type="area"
                          height="270"
                        />
                        <Row className="justify-content-center">
                          <Col lg="6" className="date-btn">
                            <span
                              className={`custom-btn ${
                                this.state.selectedTimeframe === "1D"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => this.handleTimeframeChange("1D")}
                            >
                              1D
                            </span>
                            <span
                              className={`custom-btn ${
                                this.state.selectedTimeframe === "1W"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => this.handleTimeframeChange("1W")}
                            >
                              1W
                            </span>
                            <span
                              className={`custom-btn ${
                                this.state.selectedTimeframe === "1M"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => this.handleTimeframeChange("1M")}
                            >
                              1M
                            </span>
                            <span
                              className={`custom-btn ${this.state.selectedTimeframe === "1Y" ? "active" : "" }`}
                              onClick={() => this.handleTimeframeChange("1Y")}
                            >
                              1Y
                            </span>
                            {/* <span
                              className={`custom-btn ${
                                this.state.selectedTimeframe === "ALL"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => this.handleTimeframeChange("ALL")}
                            >
                              ALL
                            </span> */}
                          </Col>
                        </Row>
                      </>
                    )}
                    <Row className="justify-content-center">
                      <Col lg="12" className="text-center finance-graph-btn">
                        <Button className="cryto-btn me-2" onClick={this.toggleSendModal}>
                          <p className="m-0">
                            Send
                          </p>
                        </Button>
                        <Button className="bitcoin-BTN me-2"  onClick={this.toggleReceiveModal}>
                          <p className="m-0">Receive</p>
                        </Button>
                        <Button className="bitcoin-BTN">
                          <p className="m-0">Swap</p>
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Container>
            </>
          ) : (
            <>            
           <Row>
                <Col lg={12}>
                  <h1 className="bitcoin-clr text-center">
                    {(this.props.isMobile) && (
                      <Link onClick={this.props.onBack} className="text-muted mbl-back-icon-finance">
                        <i className="ri-arrow-left-line back-arrow"></i>
                     </Link>
                    )}
                    <span className="mx-2">Create Wallets</span>
                  </h1>
                </Col>
              </Row>
              <Container fluid={true} className="step-back graph-finance">
                <div className="cancel-point">  
                  <div className="width-cls">
                    <div className="create-new-cls">
                      <div className="text-center">
                       
                        {this.state.generating ? (
                              <>
                                <div className="create-new text-center">
                                  <PendingIcon
                                    className="pending-icon-animate"
                                    style={{
                                      color: 'var(--skyblueText)',
                                      width: 50,
                                      height: 50,
                                      cursor: "pointer"
                                    }}
                                  />
                                  <div className="mt-3">
                                    <h3 className="msg-heading">Generating wallets, Please wait...</h3>
                                  </div>
                                </div>
                              </>
                            ) : (
                            <>
                              <div className="create-new pointer" onClick={this.createWallet}>
                                <AddNewIcon style={{ color: 'var(--skyblueText) !important',width:50,height:50, }}/>
                                <div className="mt-3">
                                  <h3 className="msg-heading">Generate all wallets.</h3>
                                </div>
                              </div>
                            </>
                          )}                       
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </>
          )}
          <ModelForm
            isOpen={sendModal}
            toggle={this.toggleSendModal}
            handleSubmit={this.handleSendSubmit}
            fields={sendFields}
            errors={errors}
            title="Send"
            handleInputChange={this.handleInputChange}
            saveButton="Send"
          />
           <ModelForm
            isOpen={labelModal}
            toggle={this.toggleLabelModal}
            handleSubmit={this.handleLabelSubmit}
            fields={labelFields}
            errors={errors}
            title="Update Label"
            handleInputChange={this.handleInputChange}
            saveButton="Update"
          />
          <Modal isOpen={receiveModal} className="modal-dialog-centered">
            <div className="bg-modal">
			    <ModalHeader className="modal-header-custom pb-1 position-relative">
			      <h2 className="modal-title-center">Wallet Address</h2>
			      <button
			        type="button"
			        className="close-custom"
			        data-dismiss="modal"
			        aria-label="Close"
			        onClick={this.toggleReceiveModal}
			      >
			        <span aria-hidden="true">&times;</span>
			      </button>
			    </ModalHeader>
              <ModalBody className="custom-modal-body">
                {wallet ? (
                  <>
                  <div className="text-center">
                    <div style={{ position: 'relative', display: 'inline-block' }} > 
                        <img src={wallet.qrcode} alt="QR code" className="w-100" />
                    </div>
                    </div>
                    <div className="id-mar">
                      <Label className="form-label id-color">
                        Wallet address
                      </Label>
                      <div className="input-with-icon id-input">
                        <Input
                          type="text"
                          className="form-control pd-cls"
                          value={wallet.address}
                          readOnly
                        />
                        <i
                          className="ri-file-copy-line input-icon pointer"
                          data-tooltip-id="id-name-tooltip"
                          data-tooltip-content="Copy wallet address."
                          onClick={() =>
                            this.handleCopy("wallet address", wallet.address)
                          }
                        ></i>
                        <Tooltip id="id-name-tooltip" />
                      </div>
                    </div>
                    <p className="mt-3">
                        Your wallet QR code/address you can share it to someone to receive fund. 
                      </p>
                    <Button className="btn cryto-btn savebtn w-100 mt-2" onClick={this.downloadQRCode}>
                      Download QR Code
                    </Button>
                  </>
                ) : null}
              </ModalBody>
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

const mapDispatchToProps = (dispatch) => ({
  changePreloader:(status) => dispatch(changePreloader(status)),
  sendMoneyRequest:(amount, receiverAddress, walletId,callback) => dispatch(sendMoneyRequest(amount, receiverAddress, walletId,callback)),
  markAsPrimaryRequest:(walletId,callback) => dispatch(markAsPrimaryRequest(walletId,callback)),
  updateWalletLabelRequest:(walletId,label,callback) => dispatch(updateWalletLabelRequest(walletId,label,callback)),
  fetchWalletBySlugRequest:(slug,callback) => dispatch(fetchWalletBySlugRequest(slug,callback)),
  createWalletsRequest:(callback) => dispatch(createWalletsRequest(callback)),
});
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Wallet));
