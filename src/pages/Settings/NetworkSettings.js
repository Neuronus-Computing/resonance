import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Label, Button, Input, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import withRouter from "../../components/Common/withRouter";
import { updateUserSettings } from "../../store/actions";

class NetworkSettings extends Component {
  constructor(props) {
    super(props);

    const identitySettings = props.user?.identity?.settings || {};

    this.state = {
      settings: {
        connectionType: identitySettings.connectionType || "auto",
        networkType: identitySettings.networkType || "mainnet",
        syncMode: identitySettings.syncMode || "fast",
        bandwidthLimit: identitySettings.bandwidthLimit || "medium",
        clearNetworkCache: identitySettings.clearNetworkCache || false,
      },
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user && this.props.user) {
      const s = this.props.user?.identity?.settings || {};
      this.setState({
        settings: {
          connectionType: s.connectionType || "auto",
          networkType: s.networkType || "mainnet",
          syncMode: s.syncMode || "fast",
          bandwidthLimit: s.bandwidthLimit || "medium",
          clearNetworkCache: !!s.clearNetworkCache,
        },
      });
    }
  }

  handleSettingChange = (key, value) => {
    this.setState((prev) => ({
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  saveSettings = () => {
    const { settings } = this.state;

    this.props.updateUserSettings(
      {
        connectionType: settings.connectionType,
        networkType: settings.networkType,
        syncMode: settings.syncMode,
        bandwidthLimit: settings.bandwidthLimit,
        clearNetworkCache: settings.clearNetworkCache,
      },
      () => {

      }
    );
  };

  render() {
    const { settings } = this.state;
    const connectionOptions = [
      { label: "Auto (default)", value: "auto" },
      { label: "NeuroSPN", value: "neurospn" },
      { label: "TOR", value: "tor" },
      { label: "I2P", value: "i2p" },
    ];
    const networkOptions = [
      { label: "Mainnet", value: "mainnet" },
      { label: "Testnet", value: "testnet" },
    ];
    const syncOptions = [
      { label: "Fast (less data, lighter verification)", value: "fast" },
      { label: "Full", value: "full" },
    ];
    const bandwidthOptions = [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
    ];

    return (
      <div className="Bitcoin-content py-3">
        <Container fluid={true} className="step-back settings p-2">
          <Row>
            <Col lg={12} className="">
              <h1 className="text-muted">NETWORK</h1>
              <div className="id-mar">
                <Label className="form-label id-color">Connection Type</Label>
                <Select
                  value={connectionOptions.find((o) => o.value === settings.connectionType)}
                  onChange={(e) => this.handleSettingChange("connectionType", e.value)}
                  options={connectionOptions}
                />
              </div>
              <hr />
              <div className="id-mar">
                <Label className="form-label id-color">Network Type</Label>
                <Select
                  value={networkOptions.find((o) => o.value === settings.networkType)}
                  onChange={(e) => this.handleSettingChange("networkType", e.value)}
                  options={networkOptions}
                />
              </div>
              <div className="id-mar">
                <Label className="form-label id-color">Sync mode</Label>
                <Select
                  value={syncOptions.find((o) => o.value === settings.syncMode)}
                  onChange={(e) => this.handleSettingChange("syncMode", e.value)}
                  options={syncOptions}
                />
              </div>
              <hr />
              <div className="id-mar">
                <Label className="form-label id-color">Limit bandwidth</Label>
                <Select
                  value={bandwidthOptions.find((o) => o.value === settings.bandwidthLimit)}
                  onChange={(e) => this.handleSettingChange("bandwidthLimit", e.value)}
                  options={bandwidthOptions}
                />
              </div>
              <div className="d-flex align-items-center gap-3 mt-3">
                <span className="id-color" style={{ minWidth: 160 }}>
                  Clear network cache
                </span>
                <div className="form-check form-switch m-0">
                  <Input
                    type="switch"
                    checked={settings.clearNetworkCache}
                    onChange={(e) => this.handleSettingChange("clearNetworkCache", e.target.checked)}
                  />
                </div>
                <span className="text-muted">{settings.clearNetworkCache ? "Yes" : "No"}</span>
              </div>
              <Button className="btn cryto-btn savebtn w-100 mt-4" onClick={this.saveSettings}>
                Save Settings
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

NetworkSettings.propTypes = {
  user: PropTypes.object,
  updateUserSettings: PropTypes.func.isRequired,
};

const mapStateToProps = ({ User }) => ({
  user: User.user,
});

export default withRouter(connect(mapStateToProps, { updateUserSettings })(NetworkSettings));
