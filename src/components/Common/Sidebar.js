import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Nav, NavItem, Collapse, CardBody, Input } from "reactstrap";
import classnames from "classnames";
import PerfectScrollbar from "react-perfect-scrollbar";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: this.props.activeIndex,
    };
  }

  toggle = (index) => {
    this.setState({
      activeIndex: this.state.activeIndex === index ? null : index,
    });
  };

  render() {
    const { sidebar, onMenuItemClick } = this.props;
    const { activeIndex } = this.state;
    return (
      <div className="w-100">
        <div className="head-cht border-bottom">
          <h3 className="msg-heading">{sidebar.title}</h3>
        </div>
        <div className="main-chat-point">
        <CardBody className="py-2">
          <div className="search-box chat-search-box">
            <div className="position-relative">
              <Input type="text" placeholder="Search..." />
              <i className="ri-search-line search-icon"></i>
            </div>
          </div>
        </CardBody>
        <ul className="list-unstyled chat-list w-100 side-height main-sub-sidebar-cls">
          <PerfectScrollbar className="mt-3">
          {sidebar.menuItems.length > 0 ? (
            sidebar.menuItems.map((item, index) => (
              <li key={index}>
                {item.submenu ? (
                  <>
                    <Link
                      to={item.path}
                      onClick={() => {
                        this.toggle(index);
                        if (typeof onMenuItemClick === 'function') {
                          onMenuItemClick(index,item);
                        }
                      }}
                      className={classnames({
                        'nav-link-hover': true,
                        'nav-link-active': activeIndex === index,
                      })}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="finance-sidebr">
                        <div className="text-truncate col-10 wallet-points">
                          {item.image && (
                            <span className="bgimg-cls">
                                {typeof item.image === 'string' ? (
                                    <img src={item.image} alt={item.title} className={item.classNames} />
                                 ) : (
                                    <>{item.image}</>
                                )}
                              {/* <img src={item.image} alt={item.title} className={item.classNames}/> */}
                            </span>
                          )}
                          <h6 className="title-crp">{item.title}</h6>
                          {item.title === "Escrow" && item.submenu?.some((subitem) => subitem.flag)  && <div className="badge-notification">
                              &nbsp;
                          </div>
                          }
                        </div>
                        <div className="col-2 more-crp">
                          <i className={`ri-arrow-${activeIndex === index ? "down" : "right"}-s-line`}></i>
                        </div>
                      </div>
                    </Link>
                    <Collapse isOpen={activeIndex === index} className="finance-menu-item">
                      <Nav vertical>
                      {item.title === "Wallet" && (item.submenu.length === 0) ?(
                        <NavItem>
                            <Link
                              to="/finance/wallet"
                              onClick={() => {
                                if (typeof onMenuItemClick === 'function') {
                                  onMenuItemClick(index);
                                }
                              }}
                              style={{ cursor: "pointer" }}
                              className={`nav-link-cls-hover ${activeIndex === index ? "active" : ""}`}
                            >
                              <div className={`mb-0 col-12 sub-item-fin d-flex align-items-center ${item.title === "Escrow" ? "justify-content-center" : "justify-content-between"}`}>
                                <div className="d-flex align-items-center">
                                  <i className={`ri-arrow-right-s-line mr-2`}></i>
                                  <div className={`text-truncate wallet-points sub-me ${item.title === "Wallet" ? "wallet-subtitle" : ""}`}>
                                     <i className=""></i> 
                                     Pending Creation
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </NavItem>
                        ):(
                        <>
                        {item.submenu.map((subitem, subIndex) => (
                          <NavItem key={subIndex}>
                            <Link
                              to={subitem.path}
                              onClick={() => {
                                if (typeof onMenuItemClick === 'function') {
                                  onMenuItemClick(index);
                                }
                              }}
                              style={{ cursor: "pointer" }}
                              className={`nav-link-cls-hover ${activeIndex === index ? "active" : ""}`}
                            >
                              <div className={`mb-0 col-12 sub-item-fin d-flex align-items-center ${item.title === "Escrow" ? "justify-content-center" : "justify-content-between"}`}>
                                <div className="d-flex align-items-center">
                                  {item.title === "Escrow" ? (
                                    // <i className="ri-add-line mr-2"></i>
                                    <></>
                                  ) : (
                                    <i className={`ri-arrow-${activeIndex === index ? "down" : "right"}-s-line mr-2`}></i>
                                  )}
                                  <div className={`text-truncate wallet-points sub-me ${item.title === "Wallet" ? "wallet-subtitle" : ""}`}>
                                     {subitem.icon && (<i className={`${subitem.icon}`}></i>)} 
                                     {subitem.title.length > 16 ? `${subitem.title.substring(0, 16)}...` : subitem.title}
                                     {subitem.status && (
                                    <div className="ml-auto  mx-2 wallet-balance">
                                      {subitem.status.toUpperCase()}
                                    </div>)}
                                  </div>
                                </div>
                                
                                {item.title === "Wallet" && (
                                  <>
                                    {subitem.isPrimary && (
                                      <div className="ml-auto wallet-balance">
                                        <div className="badge-notification">
                                          &nbsp;
                                      </div>
                                      </div>
                                    )}
                                    <div className="ml-auto wallet-balance">
                                      {subitem.balance} {subitem.coin}
                                    </div>
                                  </>
                                )}
                              </div>
                            </Link>
                          </NavItem>
                        ))}
                        </>
                        )}
                      </Nav>
                    </Collapse>
                  </>
                ) : (
                  <Link
                      to={item.action ? "#" : item.path}
                      onClick={(e) => {
                        if (item.action) {
                          e.preventDefault();
                          item.action();
                        }
                        this.toggle(index);
                        if (typeof onMenuItemClick === "function") {
                          onMenuItemClick(index, item);
                        }
                      }}
                      className={classnames({
                        "nav-link-hover": true,
                        "nav-link-active": activeIndex === index,
                      })}
                      style={{ cursor: "pointer" }}
                    >
                    <div className="finance-sidebr">
                      <div className="text-truncate col-10 wallet-points">
                        {item.image && (
                          <span className="bgimg-cls">
                            {typeof item.image === 'string' ? (
                                <img src={item.image} alt={item.title} className={item.classNames} />
                            ) : (
                                <>{item.image}</>
                            )}
                        {/* <img src={item.image} alt={item.title} className={item.classNames}/> */}
                      </span>
                        )}
                        <h6 className="title-crp"> {item.title} </h6>
                        </div>
                      <div className="col-2 more-crp">
                        <i className={`ri-arrow-${activeIndex === index ? "down" : "right"}-s-line`}></i>
                      </div>
                    </div>
                  </Link>
                )}
              </li>
            )))          
            : (
              <li className="text-center no-menu-item">
                <p>No menu item found</p>
              </li>
            )}
          </PerfectScrollbar>
        </ul>
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = {
  sidebar: PropTypes.shape({
    title: PropTypes.string.isRequired,
    menuItems: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        icon: PropTypes.string, // Icon class name or image path
        image: PropTypes.string, // Image path (if using images)
        path: PropTypes.string.isRequired,
        submenu: PropTypes.arrayOf(
          PropTypes.shape({
            title: PropTypes.string.isRequired,
            icon: PropTypes.string, // Icon class name or image path
            // image: PropTypes.string, // Image path (if using images)
            path: PropTypes.string.isRequired,
          })
        ),
      })
    ).isRequired,
  }).isRequired,
  onMenuItemClick: PropTypes.func.isRequired, 
  activeIndex: PropTypes.number.isRequired,
};

export default Sidebar;
