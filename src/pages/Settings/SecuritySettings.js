import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Label, Button, Input, Row, Col, Container } from "reactstrap";
import withRouter from "../../components/Common/withRouter";
import { updateUserSettings } from "../../store/actions";

class SecuritySettings extends Component {
  constructor(props) {
    super(props);

    const identitySettings = props.user?.identity?.settings || {};

    this.state = {
      seedVisible: false,
      settings: {
        pgpEnabled: identitySettings.pgpEnabled ?? true,
        autoDestruct: identitySettings.autoDestruct ?? "1d",
        readReceipts: identitySettings.readReceipts ?? false,
      },
      seedText: props.user?.seed || "",
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user && this.props.user) {
      const s = this.props.user?.identity?.settings || {};
      this.setState({
        settings: {
          pgpEnabled: s.pgpEnabled ?? true,
          autoDestruct: s.autoDestruct ?? "1d",
          readReceipts: s.readReceipts ?? false,
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

  toggleSeed = () => {
    this.setState((prev) => ({ seedVisible: !prev.seedVisible }));
  };

  exportKey = () => {};

  saveSettings = () => {
    const { settings } = this.state;
    this.props.updateUserSettings(
      {
        pgpEnabled: settings.pgpEnabled,
        autoDestruct: settings.autoDestruct,
        readReceipts: settings.readReceipts,
      },
      () => {}
    );
  };

  render() {
    const { seedVisible, seedText, settings } = this.state;

    const options = [
      { label: "No", value: "no" },
      { label: "5 mint", value: "5m" },
      { label: "1 hr", value: "1h" },
      { label: "1 D", value: "1d" },
      { label: "1 month", value: "1mo" },
    ];

    return (
      <div className="Bitcoin-content py-3">
        <Container fluid className="step-back settings p-2">
          <Row>
            <Col lg={12}>
              <h1 className="text-muted">SECURITY</h1>

              {/* View Recovery Seed */}
              <div className="d-flex align-items-center justify-content-between mt-3">
                <div>
                  <span className="bitcoin-clr fs-12">View Recovery seed</span>
                </div>
                <Button className="btn cryto-btn btn-sm" onClick={this.toggleSeed}>
                  {seedVisible ? "Hide" : "View"}
                </Button>
              </div>

              <div className="mt-2 fs-12">
                <div className="id-color fw-bold">Note:</div>
                <div className="text-muted">
                  Your recovery seed is the master key to your wallet and messages. Anyone with access can take full
                  control.
                  <br />
                  🚫 Only view your seed in a secure, private environment. You will be asked to re-authenticate before
                  continuing.
                </div>
              </div>

              <div className="mt-3">
                {seedVisible
                  ? seedText
                  : "•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••"}
              </div>

              <hr />

              {/* Export Private Key */}
              <div className="d-flex align-items-center justify-content-between mt-3">
                <div>
                  <span className="bitcoin-clr fs-12">Export Private Key (Advanced)</span>
                </div>

                <Button className="btn cryto-btn btn-sm" onClick={this.exportKey}>
                  Export Key
                </Button>
              </div>

              <div className="mt-2 fs-12">
                <div className="id-color fw-bold">Note:</div>
                <div className="text-muted">
                  Export your private key for use in external wallets or advanced integrations.
                  <br />
                  🚫 This option is highly sensitive. Anyone with this key can spend your funds.
                  <br />
                  Proceed only if you understand the risks.
                </div>
              </div>

              <hr />

              {/* Messaging Security */}
              <div className="mt-4">
                <h4 className="">Messaging Security</h4>
                <div className="d-flex align-items-center justify-content-between mt-3">
                  <Label className="mb-0">PGP encryption toggle</Label>
                  <div className="form-check form-switch m-0">
                    <Input
                      type="switch"
                      checked={!!settings.pgpEnabled}
                      onChange={(e) => this.handleSettingChange("pgpEnabled", e.target.checked)}
                    />
                  </div>
                </div>

                <hr />

                {/* Auto-destruct options */}
                <div className="d-flex align-items-center justify-content-between">
                  <Label className="mb-0">Auto-destruct messages</Label>

                  <div className="d-flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const active = settings.autoDestruct === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => this.handleSettingChange("autoDestruct", opt.value)}
                          className={[
                            "btn",
                            "btn-sm",
                            "rounded-pill",
                            "fw-bold",
                            "fs-12",
                            active ? "btn-primary" : "btn-light",
                            "border",
                          ].join(" ")}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <hr />

                {/* Read receipts */}
                <div className="d-flex align-items-center justify-content-between">
                  <Label className="">Read receipts</Label>

                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted fs-12 fw-bold">No</span>

                    <div className="form-check form-switch m-0">
                      <Input
                        type="switch"
                        checked={!!settings.readReceipts}
                        onChange={(e) => this.handleSettingChange("readReceipts", e.target.checked)}
                      />
                    </div>

                    <span className="text-muted fs-12 fw-bold">Yes</span>
                  </div>
                </div>
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

SecuritySettings.propTypes = {
  user: PropTypes.object,
  updateUserSettings: PropTypes.func.isRequired,
};

const mapStateToProps = ({ User }) => ({
  user: User.user,
});

export default withRouter(connect(mapStateToProps, { updateUserSettings })(SecuritySettings));
