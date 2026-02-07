import React, { Component } from "react";
import MetisMenu from "metismenujs";
import { Link } from "react-router-dom";
import user2 from "../../assets/images/user-img.png";
import { withTranslation } from "react-i18next";
import logodark from "../../assets/images/logo-dark.png";
import logosmlight from "../../assets/images/logo-sm-light.svg";
import logolight from "../../assets/images/logo-light.svg";
import { ReactComponent as WalletImg } from "../../assets/images/Wallet.svg";
import { ReactComponent as MessageIcon } from "../../assets/images/Message.svg";
import { ReactComponent as DollarIcon } from "../../assets/images/Fianance.svg";
import { ReactComponent as SettingsIcon } from "../../assets/images/Settings.svg";
import { ReactComponent as ToolsIcon } from "../../assets/images/Tools.svg";
import { ReactComponent as UserIcon } from "../../assets/images/user.svg";
import { connect } from "react-redux";
import {
  changeLayout,
  changeSidebarTheme,
  changeSidebarType,
  changeLayoutWidth,
  changePreloader,
  changeLayoutTheme,
  getContacts,
  selectUser,
  fetchMenuManagement,
} from "../../store/actions";
import withRouter from "../Common/withRouter";
class SidebarContent extends Component {
  constructor(props) {
    super(props);
    const settings =this.props.user?.identity?.settings;
    this.state = {
      pathName: this.props.router.location.pathname,
      theme: props.theme || "light",
      badgeVisible: false,
      escrowUpdated: false,
      changedChats: {},
    };
    this.changeLayoutTheme = this.changeLayoutTheme.bind(this);
    this._onSidebarEnter = null;
    this._onSidebarLeave = null;
    this._onEdgeMove = null;
    this.metis = null;
  }
  componentDidMount() {
    this.initMenu();
    const { getContacts, fetchMenuManagement } = this.props;
    if (window.location.pathname !== "/messages") {
      this.props.selectUser({});
      getContacts(null);
    }
    if (this.props.chats && this.props.chats.length > 0) {
      const hasUnreadChats = this.props.chats.some(
        (chat) => chat.unreadCount > 0 || chat.state === "request"
      );

      if (hasUnreadChats !== this.state.badgeVisible) {
        this.setState({ badgeVisible: hasUnreadChats });
      }
    }
    fetchMenuManagement();
    this.applySidebarUIBehavior();
  }
  componentDidUpdate(prevProps) {
    if (this.props.router.location.pathname !== prevProps.router.location.pathname) {
      this.setState({ pathName: this.props.router.location.pathname }, () => {
        this.initMenu();
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (this.props.type !== prevProps.type) {
      this.initMenu();
    }
    if (prevProps.chats !== this.props.chats) {
      if (!window.location.pathname.includes("messages")) {
        // this.props.selectUser({});
        // this.props.getContacts(null);
      }
      
      const { chats } = this.props;
      let showBadge = false;
      if (chats && chats.length > 0) {
        showBadge = chats.some((chat) => {
          const prevChat = (prevProps.chats || []).find((c) => c.address === chat.address);
          const stateChangedFromPending =
            prevChat && prevChat.state === "pending" && chat.state !== "pending";
          return chat.state === "request" || stateChangedFromPending || chat.unreadCount > 0;
        });
      }
      if (showBadge !== this.state.badgeVisible) {
        this.setState({ badgeVisible: showBadge });
      }
    }
    if (prevProps.user?.identity?.escrows !== this.props.user?.identity?.escrows) {
      if (!window.location.pathname.includes("finance")) {
        this.setState({ escrowUpdated: true });
      }
    }
    if (prevProps.theme !== this.props.theme) {
      this.setState({ theme: this.props.theme });
    }
   if (
      prevProps.user?.identity?.settings !== this.props.user?.identity?.settings ||
      prevProps.menu?.tools !== this.props.menu?.tools
    ) {
      this.initMenu();
    }
    const prevSettings = prevProps.user?.identity?.settings || {};
    const curSettings = this.props.user?.identity?.settings || {};
    const prevCompact = !!prevSettings.menuCompactSidebar;
    const curCompact = !!curSettings.menuCompactSidebar;
    const prevAutoHide = !!prevSettings.menuAutoHideSidebar;
    const curAutoHide = !!curSettings.menuAutoHideSidebar;
    if (prevCompact !== curCompact || prevAutoHide !== curAutoHide) {
      this.applySidebarUIBehavior();
    }
  }
  componentWillUnmount() {
    this.disableAutoHide();
    if (this.metis && typeof this.metis.dispose === "function") {
      this.metis.dispose();
    }
    this.metis = null;
  }
  resetMenuActive = () => {
    const ul = document.getElementById("side-menu");
    if (!ul) return;
    const links = ul.getElementsByTagName("a");
    for (let i = 0; i < links.length; i++) {
      links[i].classList.remove("active");
      links[i].classList.remove("mm-active");
    }
    const lis = ul.getElementsByTagName("li");
    for (let i = 0; i < lis.length; i++) {
      lis[i].classList.remove("mm-active");
    }
    const uls = ul.getElementsByTagName("ul");
    for (let i = 0; i < uls.length; i++) {
      uls[i].classList.remove("mm-show");
    }
  };

  findMatchingMenuItem = (items, currentPath, currentSearch) => {
    if (!items || !items.length) return null;
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      if (!a) continue;
      if (a.pathname === currentPath) return a;
      if (a.pathname && currentPath.startsWith(a.pathname)) return a;
      const href = a.getAttribute("href") || "";
      if (href.includes("?")) {
        const [p, q] = href.split("?");
        if (p === currentPath) {
          const cur = new URLSearchParams(currentSearch || "");
          const linkQ = new URLSearchParams(q || "");
          if (linkQ.get("id") && cur.get("id") && linkQ.get("id") === cur.get("id")) {
            return a;
          }
          if (!linkQ.get("id")) return a;
        }
      }
    }
    return null;
  };
  initMenu() {
    if (this.metis && typeof this.metis.dispose === "function") {
      this.metis.dispose();
    }
    this.resetMenuActive();
    this.metis = new MetisMenu("#side-menu");
    const ul = document.getElementById("side-menu");
    if (!ul) return;
    const items = ul.getElementsByTagName("a");
    const currentPath = this.props.router.location.pathname;
    const currentSearch = this.props.router.location.search || "";
    const matchingMenuItem = this.findMatchingMenuItem(items, currentPath, currentSearch);
    if (matchingMenuItem) {
      this.activateParentDropdown(matchingMenuItem);
    }
  }
  activateParentDropdown = (item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;
      if (parent2) {
        parent2.classList.add("mm-show");
        const parent3 = parent2.parentElement;
        if (parent3) {
          parent3.classList.add("mm-active");
          if (parent3.childNodes && parent3.childNodes[0]) {
            parent3.childNodes[0].classList.add("mm-active");
          }
          const parent4 = parent3.parentElement;
          if (parent4) {
            parent4.classList.add("mm-active");
          }
        }
      }
    }
    return false;
  };
  getMenuSettings = () => {
    const s = this.props.user?.identity?.settings || {};
    return {
      sidebarItems: s.menuSidebarItems || {
        messages: true,
        finance: true,
        settings: true,
      },
      applicationToolId: s.menuApplicationId || "",
    };
  };
  getSidebarUISettings = () => {
    const s = this.props.user?.identity?.settings || {};
    return {
      compact: !!s.menuCompactSidebar,
      autoHide: !!s.menuAutoHideSidebar,
    };
  };
  getSidebarWidths = () => {
    const { compact } = this.getSidebarUISettings();
    return {
      shown: compact ? 80 : 240,
      hidden: 0,
    };
  };
  setSidebarWidthPx = (px) => {
    const sidebar = document.getElementById("verticleMenu");
    const mainEls = document.getElementsByClassName("main-content");
    if (!sidebar) return;
    sidebar.style.width = `${px}px`;
    sidebar.style.minWidth = `${px}px`;
    sidebar.style.maxWidth = `${px}px`;
    sidebar.style.transition = "width 0.2s ease";
    sidebar.style.overflow = "hidden";
    sidebar.style.pointerEvents = px === 0 ? "none" : "auto";
    if (mainEls && mainEls.length > 0) {
      const main = mainEls[0];
      main.style.marginLeft = `${px}px`;
      main.style.transition = "margin-left 0.2s ease";
    }
  };
  showSidebar = () => {
    const { shown } = this.getSidebarWidths();
    this.setSidebarWidthPx(shown);
  };
  hideSidebar = () => {
    const { hidden } = this.getSidebarWidths();
    this.setSidebarWidthPx(hidden);
  };
  applyVerticalMenuWidth = () => {
    const { compact } = this.getSidebarUISettings();
    const width = compact ? 80 : 240;
    this.setSidebarWidthPx(width);
  };
  enableAutoHide = () => {
    const sidebar = document.getElementById("verticleMenu");
    if (!sidebar) return;
    this.disableAutoHide();
    this.hideSidebar();
    this._onSidebarEnter = () => this.showSidebar();
    this._onSidebarLeave = () => this.hideSidebar();
    sidebar.addEventListener("mouseenter", this._onSidebarEnter);
    sidebar.addEventListener("mouseleave", this._onSidebarLeave);
    this._onEdgeMove = (e) => {
      if (e.clientX <= 6) this.showSidebar();
    };
    document.addEventListener("mousemove", this._onEdgeMove);
  };
  disableAutoHide = () => {
    const sidebar = document.getElementById("verticleMenu");
    if (sidebar && this._onSidebarEnter) {
      sidebar.removeEventListener("mouseenter", this._onSidebarEnter);
      this._onSidebarEnter = null;
    }
    if (sidebar && this._onSidebarLeave) {
      sidebar.removeEventListener("mouseleave", this._onSidebarLeave);
      this._onSidebarLeave = null;
    }
    if (this._onEdgeMove) {
      document.removeEventListener("mousemove", this._onEdgeMove);
      this._onEdgeMove = null;
    }
  };
  applySidebarUIBehavior = () => {
    const { autoHide } = this.getSidebarUISettings();
    if (autoHide) {
      this.enableAutoHide();
    } else {
      this.disableAutoHide();
      this.applyVerticalMenuWidth();
    }
  };
  getSelectedApplicationTool = () => {
    const { applicationToolId } = this.getMenuSettings();
    const tools = this.props.menu?.tools || [];
    if (!applicationToolId) return null;
    return tools.find((t) => String(t.id) === String(applicationToolId)) || null;
  };
  getSlotTitle = (slot) => {
    return (
      slot?.label ||
      slot?.tool?.name ||
      slot?.wallet?.label ||
      slot?.wallet?.coin ||
      slot?.contact?.nickname ||
      slot?.contact?.name ||
      "Slot"
    );
  };
  getSlotIcon = (slot) => {
    return slot?.tool?.image || slot?.wallet?.image || slot?.contactMeta?.avatar || null;
  };
  getSlotIdByType = (slot) => {
    if (!slot) return null;
    if (slot.type === "wallet") {
      return slot.walletId || slot?.wallet?.id || slot?.wallet?.walletId || null;
    }
    if (slot.type === "contact" || slot.type === "message") {
      return (
        slot.contactIdentityId ||
        slot?.contact?.identityId ||
        slot?.contact?.id ||
        slot?.contactId ||
        null
      );
    }
    if (slot.type === "tool") {
      return slot.toolId || slot?.tool?.id || null;
    }

    return null;
  };

  getSlotTo = (slot) => {
    const id = this.getSlotIdByType(slot);

    if (slot.type === "wallet")
      return id ? `/finance/wallet/${slot?.wallet?.slug}` : "/finance/wallet";

    if (slot.type === "contact" || slot.type === "message")
      return id ? `/messages?id=${slot.contactId}` : "/messages";

    if (slot.type === "tool") return id ? `/tools?id=${id}` : "/tools";

    return "/";
  };

  handleSlotClick = (e, slot) => {
    if (!slot) return;
    if (slot.type === "tool" && slot?.tool?.isOpenLink) {
      e.preventDefault();
      const url =
        slot?.tool?.link ||
        slot?.tool?.url ||
        slot?.tool?.openLink ||
        slot?.tool?.href ||
        "";

      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  isSlotActive = (slot, currentPath, currentSearch) => {
    if (!slot) return false;

    if (slot.type === "wallet") {
      const id = this.getSlotIdByType(slot);
      return id
        ? currentPath.startsWith(`/finance/wallet/${id}`)
        : currentPath.startsWith("/finance/wallet");
    }
    if (slot.type === "contact" || slot.type === "message") {
      const id = this.getSlotIdByType(slot);
      if (!currentPath.startsWith("/message") && !currentPath.startsWith("/messages")) return false;
      if (!id) return true;
      const params = new URLSearchParams(currentSearch || "");
      return String(params.get("id")) === String(id);
    }
    if (slot.type === "tool") {
      if (slot?.tool?.isOpenLink) return false;
      const id = this.getSlotIdByType(slot);
      if (!currentPath.startsWith("/tools")) return false;
      if (!id) return true;
      const params = new URLSearchParams(currentSearch || "");
      return String(params.get("id")) === String(id);
    }

    return false;
  };

  changeLayoutTheme(e) {
    const newTheme = e.target.value;
    this.setState({ theme: newTheme });
    this.props.changeLayoutTheme(newTheme);
  }
  getPresenceStatus = () => {
    const raw = this.props.user?.identity?.settings?.status || "offline";
    return raw === "ghost" ? "invisible" : raw;
  };

  shouldShowBadgeByStatus = () => {
    const status = this.getPresenceStatus();
    switch (status) {
      case "available":
        return true;  
      case "only_important":
        return false;
      case "busy":
      case "away":
      case "invisible":
      case "offline":
      default:
        return false;
    }
  };
  
  render() {
    const { user, isOpened } = this.props;
    const { badgeVisible, escrowUpdated } = this.state;
    const avatarURL = user?.identity?.avatar ? user.identity.avatar : user2;
    const { router } = this.props;
    const path = router.location.pathname;
    const search = router.location.search || "";
    const isActiveRoute = (route) => path.startsWith(route);
    const { compact } = this.getSidebarUISettings();
    const allowBadgeByStatus = this.shouldShowBadgeByStatus();

    return (
      <React.Fragment>
        <div className="navbar-brand-box">
          <Link to="#" className="logo logo-dark">
            {compact ? (
              <span className="logo-lg">
                <img src={logosmlight} alt="" style={{ width: "20%" }} />
              </span>
            ) : (
              <span className="logo-lg">
                <img src={logodark} alt="" style={{ width: "100%" }} />
              </span>
            )}
          </Link>

          <Link to="#" className="logo logo-light">
            {compact ? (
              <span className="logo-lg">
                <img src={logosmlight} alt="" style={{ width: "20%" }} />
              </span>
            ) : (
              <span className="logo-lg">
                <img src={logolight} alt="" style={{ width: "100%" }} />
              </span>
            )}
          </Link>
        </div>

        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled side-margin mbl-scr" id="side-menu">
            {(() => {
              const { sidebarItems } = this.getMenuSettings();
              const appTool = this.getSelectedApplicationTool();

              return (
                <>
                  {sidebarItems?.messages && (
                    <li className={`${isActiveRoute("/messages") ? "mm-active" : ""}`}>
                      <Link
                        to="/messages"
                        className={`waves-effect icons-side msg-point ${
                          isActiveRoute("/messages") ? "active" : ""
                        }`}
                        style={{ paddingLeft: "20px" }}
                      >
                        <MessageIcon style={{ width: 20, height: 23 }} className="message-icon" />
                        {allowBadgeByStatus && badgeVisible && <div className="badge-notification">&nbsp;</div>}
                        {!compact && <span className="ms-2">{this.props.t("Messages")}</span>}
                      </Link>
                    </li>
                  )}

                  {sidebarItems?.finance && (
                    <li className={`${isActiveRoute("/finance") ? "mm-active" : ""}`}>
                      <Link
                        to="/finance/wallet"
                        className={`waves-effect icons-side ${
                          isActiveRoute("/finance") ? "active" : ""
                        }`}
                        onClick={() => this.setState({ escrowUpdated: false })}
                      >
                        <DollarIcon style={{ width: 30, height: 23 }} className="message-icon" />
                        {!compact && <span className="ms-2">{this.props.t("Finance")}</span>}
                        {allowBadgeByStatus && escrowUpdated && <div className="badge-notification">&nbsp;</div>}
                      </Link>
                    </li>
                  )}

                  {sidebarItems?.settings && (
                    <li className={`${isActiveRoute("/settings") ? "mm-active" : ""}`}>
                      <Link
                        to="/settings"
                        className={`waves-effect icons-side ${
                          isActiveRoute("/settings") ? "active" : ""
                        }`}
                      >
                        <SettingsIcon style={{ width: 30, height: 23 }} className="message-icon" />
                        {!compact && <span className="ms-2">{this.props.t("Settings")}</span>}
                      </Link>
                    </li>
                  )}

                  {appTool ? (
                    <li className={`${isActiveRoute(`/tools`) ? "mm-active" : ""}`}>
                      <Link
                        to={appTool.isOpenLink ? "#" : `/tools?id=${appTool.id}`}
                        onClick={(e) => {
                          if (appTool.isOpenLink) {
                            e.preventDefault();
                            const url =
                              appTool.link || appTool.url || appTool.openLink || appTool.href;
                            if (url) window.open(url, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className={`waves-effect icons-side ${
                          isActiveRoute(`/tools`) ? "active" : ""
                        }`}
                      >
                        {/* {appTool.image ? (
                          <img
                            src={appTool.image}
                            alt=""
                            style={{ width: 30, height: 23, objectFit: "cover" }}
                            className="message-icon"
                          />
                        ) : ( */}
                          <ToolsIcon style={{ width: 30, height: 23 }} className="message-icon" />
                        {/* )} */}
                        {!compact && 
                          <span className="ms-2">
                           {appTool.name.length > 10 ? `${this.props.t(appTool.name.substring(0, 10))}...` : this.props.t(appTool.name)}
                          </span>
                        }
                      </Link>
                    </li>
                  ) : null}
                </>
              );
            })()}

            {(this.props.menu?.slots || []).map((slot) => {
              const title = this.getSlotTitle(slot);
              const icon = this.getSlotIcon(slot);
              const to = this.getSlotTo(slot);
              const active = this.isSlotActive(slot, path, search);

              return (
                <li key={`slot-${slot.id}`} className={`${active ? "mm-active" : ""}`}>
                  <Link
                    to={to}
                    onClick={(e) => this.handleSlotClick(e, slot)}
                    className={`waves-effect icons-side ${active ? "active" : ""}`}
                    style={{ paddingLeft: "20px" }}
                  >
                    {/* {icon ? (
                      <img
                        src={icon}
                        alt=""
                        className="message-icon"
                        style={{ width: 30, height: 23, objectFit: "cover" }}
                      />
                    ) : ( */}
                     <>
                      {slot.type === "wallet" ? (
                        <WalletImg style={{ width: 30, height: 23 }} className="message-icon" />
                      ) : slot.type === "tool" ? (
                        <ToolsIcon style={{ width: 30, height: 23 }} className="message-icon" />
                      ) : slot.type === "contact" ? (
                        <UserIcon style={{ width: 30, height: 23 }} className="message-icon" />
                      ) : null}
                    </>
                    {/* )} */}

                    {!compact && 
                      <span className="ms-2">
                        {title.length > 10 ? `${this.props.t(title.substring(0, 10))}...` : this.props.t(title)}
                      </span>}
                  </Link>
                </li>
              );
            })}
            </ul>
            <ul className="metismenu list-unstyled bottom-sidebar-part" id="side-menu">
            <li className={`${isActiveRoute("/profile") ? "mm-active" : ""}`}>
              {isOpened ? (
                <Link
                  to="/profile"
                  className={`waves-effect name-id ${isActiveRoute("/profile") ? "active" : ""}`}
                  style={{ marginBottom: "17px" }}
                >
                  <span className="logo-sm user-img-cls rounded-circle">
                    <img src={avatarURL} alt="user-icon" width="30" height="30" />
                  </span>

                  {!compact && (
                    <>
                      <span className="ms-1">
                        <small>
                          {user?.identity?.address
                            ? user.identity.address.substring(0, 11).toUpperCase()
                            : "N/A"}
                          ..
                        </small>
                      </span>
                      <span className="id-names">
                        <i className="ri-arrow-right-s-line"></i>
                      </span>
                    </>
                  )}
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="waves-effect icon-profile"
                  style={{ marginBottom: "18px" }}
                >
                  <img src={avatarURL} alt="user-icon" className="ava-custom" />
                </Link>
              )}
            </li>
          </ul>
        </div>
      </React.Fragment>
    );
  }
}

const mapStatetoProps = (state) => {
  return {
    ...state.Layout,
    user: state.User.user,
    chats: state.chat.chats,
    menu: state.menu,
  };
};

export default withRouter(
  connect(mapStatetoProps, {
    changeLayout,
    changeSidebarTheme,
    changeSidebarType,
    changeLayoutWidth,
    changePreloader,
    changeLayoutTheme,
    getContacts,
    selectUser,
    fetchMenuManagement,
  })(withTranslation()(SidebarContent))
);
