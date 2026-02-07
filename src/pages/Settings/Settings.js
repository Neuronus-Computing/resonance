import React, { Component } from "react";
import { connect } from "react-redux";
import Sidebar from "../../components/Common/Sidebar";
import GeneralSettings from "./GeneralSettings";
import NetworkSettings from "./NetworkSettings";
import SecuritySettings from "./SecuritySettings";
import VisibilitySettings from "./VisibilitySettings";
import MenuManagementSettings from "./MenuManagementSettings";
import PgpKeysSettings from "./PgpSettings";
import { ReactComponent as GeneralImg } from "../../assets/images/general.svg";
import { ReactComponent as NetworkImg } from "../../assets/images/network-settings.svg";
import { ReactComponent as SecurityImg } from "../../assets/images/security-setting.svg";
import { ReactComponent as VisibilityImg } from "../../assets/images/visibilty-setting.svg";
import { ReactComponent as PGPImg } from "../../assets/images/pgp-settings.svg";
import { ReactComponent as MenuImg } from "../../assets/images/menu-settings.svg";
import crypto from "../../assets/images/crypto.png";
import withRouter from "../../components/Common/withRouter";
import { updateEscrowStatus } from "../../store/actions";
import { detectDeviceType, toggleContentVisibility } from "../../helpers/ui_helpers";
class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      isMobile: window.innerWidth <= 800,
      sidebar: {
        title: "Settings",
        menuItems: [
          {
            title: "General",
            image: <GeneralImg style={{ color: 'var(--skyblue) !important' }} />,
            path: "/settings/general",
          },
          {
            title: "Network",
            image: <NetworkImg style={{ color: 'var(--skyblue) !important' }} />,
            path: "/settings/network",
          },
          {
            title: "Security",
            image: <SecurityImg style={{ color: 'var(--skyblue) !important' }} />,
            path: "/settings/security",
          },
          {
            title: "Visibility",
            image: <VisibilityImg style={{ color: 'var(--skyblue) !important' }} />,
            path: "/settings/visibility",
          },
          {
            title: "My PGP Keys",
            image: <PGPImg style={{ color: 'var(--skyblue) !important' }} />,
            path: "/settings/pgp-keys",
          },
          {
            title: "Menu Management",
            image: <MenuImg style={{ color: 'var(--skyblue) !important' }} />,
            path: "/settings/menu-management",
          },
        ],
      },
    };
  }
  componentDidUpdate(prevProps) {
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
  setActiveIndex = (index) => {
    this.setState({ activeIndex: index });
  };
  setComponent = (path) => {
    this.props.router.navigate(path);
  };
  renderComponentBasedOnPath() {
    const path = window.location.pathname;
    switch (path) {

      case "/settings/general":
        return <GeneralSettings onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile} />;
      case "/settings/network":
        return <NetworkSettings onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile} />;
      case "/settings/security":
        return <SecuritySettings onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile} />;
      case "/settings/visibility":
        return <VisibilitySettings onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile} />; 
      case "/settings/pgp-keys":    
        return <PgpKeysSettings onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile} />;   
      case "/settings/menu-management":    
        return <MenuManagementSettings onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile} />;   
      default:
        return <GeneralSettings onMenuItemClick={this.setComponent} onBack={this.hideContent} isMobile={this.state.isMobile} />;
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
                onMenuItemClick={(index, menuItem = []) => {
                  this.setActiveIndex(index);
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

Settings.propTypes = {
  // Define prop types if necessary
};

const mapStateToProps = ({ User, wallet }) => ({
  user: User.user,
});


const mapDispatchToProps = {
  updateEscrowStatus
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Settings));
