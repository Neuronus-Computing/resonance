import React, { Component } from "react";

import { connect } from "react-redux";
// import { withRouter } from "react-router-dom";
import { } from "../../store/actions";
import { Button } from "reactstrap";
//Simple bar
import SimpleBar from "simplebar-react";

// Redux Store
import { toggleRightSidebar } from "../../store/actions";

import SidebarContent from "./SidebarContent";
import withRouter from "../Common/withRouter";


class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSearch: false,
            isSocialPf: false,
            isTabletOrLess: window.innerWidth <= 768
        };
        this.toggleMenu = this.toggleMenu.bind(this);
        this.toggleRightbar = this.toggleRightbar.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }
    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }
    handleResize() {
        const isTabletOrLess = window.innerWidth <= 768;
        this.setState({ isTabletOrLess });
        if (isTabletOrLess && this.props.isOpened) {
            this.toggleMenu(false); 
        } 
    }
    /**
         * Toggle sidebar
         */
    toggleMenu() {
        this.props.toggleMenuCallback();
    }

    /**
     * Toggles the sidebar
     */
    toggleRightbar() {
        this.props.toggleRightSidebar();
    }


    toggleFullscreen() {
        if (
            !document.fullscreenElement &&
        /* alternative standard method */ !document.mozFullScreenElement &&
            !document.webkitFullscreenElement
        ) {
            // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(
                    Element.ALLOW_KEYBOARD_INPUT
                );
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }
    render() {
        return (
            <React.Fragment>
                <div className="vertical-menu" id="verticleMenu">
                <Button size="sm" color="none" type="button" onClick={this.toggleMenu} className="header-item header-item-icon" id="vertical-menu-btn">
                    <i className="ri-menu-2-line align-middle"></i>
                </Button>
                    <div data-simplebar className="h-100">
                        {this.props.type !== "condensed" ? (
                            <SimpleBar style={{ maxHeight: "100%",height: "100%" }}>
                                <SidebarContent toggleMenuCallback={this.props.toggleMenuCallback} isOpened={this.props.isOpened} />
                            </SimpleBar>
                        ) : <SidebarContent toggleMenuCallback={this.props.toggleMenuCallback} isOpened={this.props.isOpened}/>}
                    </div>

                </div>
            </React.Fragment>
        );
    }
}

const mapStatetoProps = state => {
    return {
        layout: state.Layout
    };
};
export default connect(mapStatetoProps, {toggleRightSidebar})(withRouter(Sidebar));
