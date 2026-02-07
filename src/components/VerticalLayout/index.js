import React, { Component } from "react";

import { connect } from "react-redux";
// import { withRouter } from "react-router-dom";
import Loading from "../Common/Loading";
import {
  changeLayout,
  changeSidebarTheme,
  changeSidebarType,
  toggleRightSidebar,
  changeTopbarTheme,
  changeLayoutTheme,
  changeLayoutWidth
} from "../../store/actions";
// Layout Related Components
import Sidebar from "./Sidebar";
import Rightbar from "../CommonForBoth/Rightbar";
import withRouter from "../Common/withRouter";

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isOpened:true,
      user: props.user || {},
    };
    this.toggleMenuCallback = this.toggleMenuCallback.bind(this);
    this.toggleRightSidebar = this.toggleRightSidebar.bind(this);
  }

  toggleRightSidebar() {
    this.props.toggleRightSidebar();
  }

  capitalizeFirstLetter = string => {
    return string.charAt(1).toUpperCase() + string.slice(2);
  };

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if(this.props.isPreloader === true)
        {
          document.getElementById('preloader').style.display = "block";
          document.getElementById('status').style.display = "block";

          // setTimeout(function(){ 

          // document.getElementById('preloader').style.display = "none";
          // document.getElementById('status').style.display = "none";

          // }, 2500);
        }
        else
        {
          document.getElementById('preloader').style.display = "none";
          document.getElementById('status').style.display = "none";
        }
        this.setDocumentTitle();
    }
}
setDocumentTitle() {
  const { router } = this.props;
  const path = router.location.pathname;
  let pathSegments = path.split('/').filter(segment => segment);
  pathSegments = pathSegments.map(segment => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });
  let currentPage = pathSegments.join(' - ');
  document.title = `${currentPage} | Resonance`;
}
componentDidMount() {
    // Scroll Top to 0
    window.scrollTo(0, 0);
    let currentage = this.capitalizeFirstLetter(this.props.router.location.pathname);

    currentage = currentage.replaceAll("-" , " ");
    
    document.title = currentage + " | Resonance";
      
    if (this.props.leftSideBarTheme) {
      this.props.changeSidebarTheme(this.props.leftSideBarTheme);
    }

    if (this.props.layoutWidth) {
      this.props.changeLayoutWidth(this.props.layoutWidth);
    }

    if (this.props.leftSideBarType) {
      this.props.changeSidebarType(this.props.leftSideBarType);
    }
    if (this.props.topbarTheme) {
      this.props.changeTopbarTheme(this.props.topbarTheme);
    }
    if (this.props.theme) {
      const theme = this.state.user?.identity?.theme || this.props.theme;
      this.props.changeLayoutTheme(theme);
    }

    if (this.props.showRightSidebar) {
      this.toggleRightSidebar();
    }
    if(this.props.isPreloader === true)
      {
        document.getElementById('preloader').style.display = "block";
        document.getElementById('status').style.display = "block";

        setTimeout(function(){ 

        document.getElementById('preloader').style.display = "none";
        document.getElementById('status').style.display = "none";

        }, 2500);
      }
      else
      {
        document.getElementById('preloader').style.display = "none";
        document.getElementById('status').style.display = "none";
      }
  }
  toggleMenuCallback = () => {
    if (this.props.leftSideBarType === "default") {
      this.props.changeSidebarType("condensed", this.state.isMobile);
    } else if (this.props.leftSideBarType === "condensed") {
      this.props.changeSidebarType("default", this.state.isMobile);
    }
    this.setState(prevState => ({
      isOpened: !prevState.isOpened
    }));
  };

  render() {
    return (
      <React.Fragment>
        <div id="preloader">
            <div id="status">
                <div className="spinner">
                <Loading />
                </div>
            </div>
        </div>

        <div id="layout-wrapper">
        {/* <Header toggleMenuCallback={this.toggleMenuCallback} toggleRightSidebar={this.toggleRightSidebar} /> */}
          <Sidebar
            theme={this.props.leftSideBarTheme}
            type={this.props.leftSideBarType}
            isMobile={this.state.isMobile}
            toggleMenuCallback={this.toggleMenuCallback}
            isOpened={this.state.isOpened}
          />
              <div className="main-content">
                {this.props.children}
                {/* <Footer/> */}
              </div>
        </div>
        <Rightbar />
      </React.Fragment>
    );
  }
}


const mapStatetoProps = ({  User,  Layout}) => ({
    ...Layout,
    user: User.user,

});
export default connect(mapStatetoProps, {
  changeLayout,
  changeSidebarTheme,
  changeSidebarType,
  toggleRightSidebar,
  changeTopbarTheme,
  changeLayoutTheme,
  changeLayoutWidth
})(withRouter(Layout));

