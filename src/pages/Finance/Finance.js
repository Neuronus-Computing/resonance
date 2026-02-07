import React, { Component } from "react";
import { connect } from "react-redux";
import Sidebar from "../../components/Common/Sidebar";
import CreateWallet from "./CreateWallet";
import Wallet from "./Wallet";
import NewEscrow from "./Escrow/NewEscrow";
import EscrowDetails from "./Escrow/EscrowDetails";
import FreezedEscrow from "./Escrow/FreezedEscrow";
import History from "./History/History";
import CashToCrypto from "./CashToCrypto/CashToCrypto";
import { ReactComponent as WalletImg } from "../../assets/images/Wallet.svg";
import { ReactComponent as NewEscrowImg } from "../../assets/images/New Escrow.svg";
import { ReactComponent as HistoryImg } from "../../assets/images/History of Transactions.svg";
import { ReactComponent as CashImg } from "../../assets/images/dollar-icon.svg";
import crypto from "../../assets/images/crypto.png";
import withRouter from "../../components/Common/withRouter";
import {updateEscrowStatus} from "../../store/actions";
import { detectDeviceType, toggleContentVisibility } from "../../helpers/ui_helpers";
class Finance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      isMobile: window.innerWidth <= 800,
      sidebar: {
        title: "Finance",
        menuItems: [
          // {
          //   title: "Create wallet",
          //   image: walletImage,
          //   path: "/finance/create-wallet",
          // },
          {
            title: "Wallet",
            image: <WalletImg style={{ color: 'var(--skyblue) !important'}}/>,
            submenu:this.getWalletSubmenu(),
          },
          {
            title: "Escrow",
            image: <NewEscrowImg style={{ color: 'var(--skyblue) !important'}}/>,
            classNames:"escrow-point",
            submenu: this.getEscrowSubmenu(),
          },
          {
            title: "History of transactions",
            image: <HistoryImg style={{ color: 'var(--skyblue) !important'}}/>, 
            path: "/finance/history",
            classNames:"historypoint",
          },
          {
            title: "Cash to crypto",
            image: <CashImg style={{ width:30, color: 'var(--skyblue) !important'}}/>,
            path: "/finance/CashToCrypto",
            classNames:"cashimg",
          },
        ],
      },
    };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.user?.identity?.wallets !== this.props.user?.identity?.wallets || 
        prevProps.user?.identity?.escrows !== this.props.user?.identity?.escrows) {
      this.setState((prevState) => ({
        sidebar: {
          ...prevState.sidebar,
          menuItems: prevState.sidebar.menuItems.map((item) =>
            item.title === "Wallet"
              ? { ...item, submenu: this.getWalletSubmenu() }
              : item.title === "Escrow"
              ? { ...item, submenu: this.getEscrowSubmenu() }
              : item
          ),
        },
      }));
    }
  }
  componentDidMount() {
    const deviceType = detectDeviceType();
    this.setState({ deviceType });
  }
  hideContent = () => {
    toggleContentVisibility(this.state.deviceType, "hide");
  };

  showContent = () => {
    toggleContentVisibility(this.state.deviceType, "show");
  };

  getWalletSubmenu = () => {
    const { user } = this.props;
    if (user && user.identity && user.identity.wallets) {
      return user.identity.wallets.map(wallet => ({
        title: wallet.label, 
        icon: "ri-wallet-line",
        coin: wallet.coin.toUpperCase(),
        balance: Number(wallet.balance),
        // .toFixed(2),
        path: `/finance/wallet/${wallet.slug}`,
        isPrimary: wallet.isPrimary,
      }));
    }
    return [];
  };
  getEscrowSubmenu = () => {
    const { user } = this.props;
    const submenu = [
      {
        title: "Create", 
        icon: "ri-add-line mr-2",
        path: "/finance/new-escrow",
      },
    ];
    if (user && user.identity && user.identity.escrows) {
      const escrowItems = user.identity.escrows.map(escrow => {
        const path = escrow.status === 'pending'
          ? `/finance/escrow-details/${escrow.id}`
          : `/finance/freezed-escrow/${escrow.id}`;
        return {
          title: `Escrow (${Number(escrow.amount).toFixed(2)} ${escrow.coin.toUpperCase()}) `,
          status: escrow.status,
          flag: escrow.flag ?? false,
          path: path,
          icon: "",
        };
      });
      return [...submenu, ...escrowItems];
    }
  
    return submenu; 
  };
  setActiveIndex = (index) => {
    this.setState({ activeIndex: index });
  };
    setComponent = (path) => {
      this.props.router.navigate(path); 
    };
  renderComponentBasedOnPath() {
    const path = window.location.pathname;
    switch (path) {
      case "/finance/create-wallet":
        // return <CreateWallet onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile}/>;
      // case "/finance/wallet":
      case path.match(/^\/finance\/wallet\/([a-zA-Z0-9-]+)$/)?.input: 
        return <Wallet onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile}/>;
      case "/finance/new-escrow":
        return <NewEscrow onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile}/>;
      // case "/finance/escrow-details":
      case path.match(/^\/finance\/escrow-details\/([a-zA-Z0-9-]+)$/)?.input: 
        return <EscrowDetails  onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile}/>;
      // case "/finance/freezed-escrow":
      case path.match(/^\/finance\/freezed-escrow\/([a-zA-Z0-9-]+)$/)?.input: 
      return <FreezedEscrow  onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile}/>;
        case "/finance/history":
      return <History  onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile}/>;
        case "/finance/CashToCrypto":
        return <CashToCrypto  onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile}/>;
      default:
        return <Wallet onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile}/>;
    }
  }
  render() {
    const { sidebar, activeIndex } = this.state;

    return (
      <div className="page-content">
        <div className="right-msg container">
          <div className="d-lg-flex h-finance">
            <div className="chat-leftsidebar" id="leftbar">
            <Sidebar
              sidebar={sidebar}
              onMenuItemClick={(index, menuItem=[]) => {
                this.setActiveIndex(index);
                if (!menuItem.submenu || menuItem.submenu.length === 0) {
                  this.showContent();
                }
                if (menuItem.title === "Escrow"  && menuItem.submenu.some((subitem) => subitem.flag)) {
                  this.props.updateEscrowStatus(null,true);
                }
              }}
              onBack={() => {
                this.hideContent();
              }}
              // onMenuItemClick={(index) => this.setActiveIndex(index)} 
              activeIndex={activeIndex}
            />
            </div>
            <div className="w-100 user-chat mt-sm-0 overflow-hidden" id="content">
              {this.renderComponentBasedOnPath()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Finance.propTypes = {
  // Define prop types if necessary
};

const mapStateToProps = ({ User, wallet }) => ({
  user: User.user,
});


const mapDispatchToProps = {
  updateEscrowStatus
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Finance));
