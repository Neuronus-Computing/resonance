// src/pages/Tools/index.js (or wherever your Tools page lives)
import React, { Component } from "react";
import { connect } from "react-redux";
import withRouter from "../../components/Common/withRouter";
import { detectDeviceType, toggleContentVisibility } from "../../helpers/ui_helpers";
import axios from "../../util/axiosConfig";
import { Link } from "react-router-dom";

class Tools extends Component {
  constructor(props) {
    super(props);
    this.iframeContainerRef = React.createRef();
    this.state = {
      isMobile: window.innerWidth <= 800,
      deviceType: "",
      showIframe: false,
      iframeSrc: "",
      tools: [],
      activeTool: null,
      loading: false,
    };
  }

  componentDidMount() {
    const deviceType = detectDeviceType();
    this.setState({ deviceType }, () => {
      this.fetchToolsAndOpenFromQuery();
    });

    // optional: handle resize
    this._onResize = () => this.setState({ isMobile: window.innerWidth <= 800 });
    window.addEventListener("resize", this._onResize);
  }

  componentDidUpdate(prevProps) {
    const prevSearch = prevProps.router?.location?.search || "";
    const nextSearch = this.props.router?.location?.search || "";

    // If ?id= changed, open the new tool
    if (prevSearch !== nextSearch) {
      this.openToolFromQuery();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._onResize);
  }

  hideContent = () => {
    toggleContentVisibility(this.state.deviceType, "hide");
  };

  showContent = () => {
    toggleContentVisibility(this.state.deviceType, "show");
  };

  getToolIdFromQuery = () => {
    const search = this.props.router?.location?.search || "";
    const params = new URLSearchParams(search);
    const id = params.get("id");
    return id ? String(id) : null;
  };

  fetchToolsAndOpenFromQuery = async () => {
    this.setState({ loading: true });
    try {
      const response = await axios.get("/user/tools");
      const tools = response.data || [];

      this.setState(
        {
          tools,
          loading: false,
        },
        () => {
          this.openToolFromQuery();
        }
      );
    } catch (error) {
      console.error("Error fetching tools:", error);
      this.setState({ loading: false });
    }
  };

  openToolFromQuery = () => {
    const toolId = this.getToolIdFromQuery();
    const { tools } = this.state;

    if (!toolId) {
      this.setState({ showIframe: false, iframeSrc: "", activeTool: null });
      return;
    }

    const tool = tools.find((t) => String(t.id) === String(toolId));
    if (!tool) {
      this.setState({ showIframe: false, iframeSrc: "", activeTool: null });
      return;
    }

    this.handleToolOpen(tool);
  };

  buildToolUrlWithToken = (rawLink) => {
    try {
      const token = localStorage.getItem("authToken") || "";
      const url = rawLink.startsWith("http")
        ? new URL(rawLink)
        : new URL(rawLink, window.location.origin);
      if (token) url.searchParams.set("token", token);
      if (!rawLink.startsWith("http")) return url.pathname + url.search + url.hash;
      return url.toString();
    } catch (e) {
      const token = localStorage.getItem("authToken") || "";
      if (!token) return rawLink;
      return rawLink.includes("?") ? `${rawLink}&token=${token}` : `${rawLink}?token=${token}`;
    }
  };

  handleToolOpen = (tool) => {
    if (tool.isOpenLink) {
      const url = tool.link || tool.url || tool.openLink || tool.href;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      this.setState({ showIframe: false, iframeSrc: "", activeTool: tool });
      return;
    }
    this.showContent();
    const iframeSrc = this.buildToolUrlWithToken(tool.link);

    this.setState({
      showIframe: true,
      iframeSrc,
      activeTool: tool,
    });
  };

  renderBody() {
    const { loading, showIframe, iframeSrc, activeTool } = this.state;
    const toolId = this.getToolIdFromQuery();

    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
            color: "#666",
          }}
        >
          <div>
            <h3 className="msg-heading">Loading tools...</h3>
            <p>Please wait.</p>
          </div>
        </div>
      );
    }

    if (!toolId) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
            color: "#666",
          }}
        >
          <div>
            <h3 className="msg-heading">No Tool Selected</h3>
            <p>Open a tool using a link like <b>/tools?id=TOOL_ID</b>.</p>
          </div>
        </div>
      );
    }

    // id exists but tool not found
    if (toolId && !activeTool) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
            color: "#666",
          }}
        >
          <div>
            <h3 className="msg-heading">Tool Not Found</h3>
            <p>This tool id does not exist or is not available.</p>
          </div>
        </div>
      );
    }

    // openLink tool opened in new tab
    if (activeTool?.isOpenLink) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
            color: "#666",
          }}
        >
          <div>
            <h3 className="msg-heading">{activeTool.name}</h3>
            <p>This tool opens in a new tab.</p>
          </div>
        </div>
      );
    }

    // iframe tool
    return showIframe ? (
      <iframe
        src={iframeSrc}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Tool Iframe"
      />
    ) : (
      <div
        ref={this.iframeContainerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <div>
          <h3 className="msg-heading">Loading tool...</h3>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  render() {
    const { isMobile } = this.state;

    return (
      <div className="page-content">
        <div className="right-msg container">
          <div className="d-lg-flex h-tools">
            <div className="w-100 user-chat mt-sm-0" style={{ height: "100vh" }} id="content">
              {isMobile && (
                <Link onClick={this.hideContent} className="text-muted mbl-back-icon-finance">
                  <i className="ri-arrow-left-line back-arrow"></i>
                </Link>
              )}

              {this.renderBody()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ User }) => ({
  user: User.user,
});

export default withRouter(connect(mapStateToProps, null)(Tools));
