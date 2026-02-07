import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Label, Input, Button, Container, Col, Row, Card, CardBody } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import withRouter from "../../components/Common/withRouter";
import { updateUserSettings } from "../../store/actions";

class VisibilitySettings extends Component {
  constructor(props) {
    super(props);

    const settings = props.user?.identity?.settings || {};

    this.state = {
      settings: {
        showLastSeen: settings.showLastSeen || "everyone",
        showStatusMessage: settings.showStatusMessage || "everyone",
        showPgpPublicKey: settings.showPgpPublicKey || "everyone",
        showMyIdNumber: settings.showMyIdNumber || "none",
        showMyNickname: settings.showMyNickname || "friends",
        showMyAvatar: settings.showMyAvatar || "none",
        findableBySearch:
          typeof settings.findableBySearch === "boolean"
            ? settings.findableBySearch
            : true,
      },
    };
  }

  handleChange = (key, value) => {
    this.setState((prev) => ({
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  saveSettings = () => {
    const { settings } = this.state;

    const allowed = new Set(["everyone", "friends", "none"]);
    const enumFields = [
      "showLastSeen",
      "showStatusMessage",
      "showPgpPublicKey",
      "showMyIdNumber",
      "showMyNickname",
      "showMyAvatar",
    ];

    for (const field of enumFields) {
      if (!allowed.has(settings[field])) {
        toast.error(`Invalid value for ${field}`);
        return;
      }
    }

    this.props.updateUserSettings(settings, () => {
      // toast.success("Visibility settings updated");
    });
  };

  render() {
    const { settings } = this.state;

    const visibilityOptions = [
      { label: "Everyone", value: "everyone" },
      { label: "Friends", value: "friends" },
      { label: "Nobody", value: "none" },
    ];

    const valueOf = (key) =>
      visibilityOptions.find((v) => v.value === settings[key]);

    return (
      <div className="Bitcoin-content py-3">
        <Container fluid={true} className="step-back settings p-2">
          <Row>
            <Col lg={12}>
              <h1 className="text-muted mb-4">VISIBILITY</h1>
              <Card>
                <CardBody>
                  <h6 className="id-color">Profile Visibility</h6>
                  <Row className="align-items-center mb-3">
                    <Col lg="6" sm="12">
                      <Label className="form-label  mb-0">Show Last Seen</Label>
                    </Col>
                    <Col lg="6" sm="12">
                      <Select
                        value={valueOf("showLastSeen")}
                        onChange={(e) => this.handleChange("showLastSeen", e.value)}
                        options={visibilityOptions}
                      />
                    </Col>
                  </Row>
                  <hr />
                  <Row className="align-items-center mb-3">
                    <Col lg="6" sm="12">
                      <Label className="form-label  mb-0">
                        Show status message / Tagline
                      </Label>
                    </Col>
                    <Col lg="6" sm="12">
                      <Select
                        value={valueOf("showStatusMessage")}
                        onChange={(e) =>
                          this.handleChange("showStatusMessage", e.value)
                        }
                        options={visibilityOptions}
                      />
                    </Col>
                  </Row>
                  <hr />
                  <Row className="align-items-center mb-3">
                    <Col lg="6" sm="12">
                      <Label className="form-label  mb-0">
                        Show PGP public key
                      </Label>
                    </Col>
                    <Col lg="6" sm="12">
                      <Select
                        value={valueOf("showPgpPublicKey")}
                        onChange={(e) =>
                          this.handleChange("showPgpPublicKey", e.value)
                        }
                        options={visibilityOptions}
                      />
                    </Col>
                  </Row>
                  <hr />
                  <Row className="align-items-center mb-3">
                    <Col lg="6" sm="12">
                      <Label className="form-label  mb-0">
                        Show my ID number
                      </Label>
                    </Col>
                    <Col lg="6" sm="12">
                      <Select
                        value={valueOf("showMyIdNumber")}
                        onChange={(e) =>
                          this.handleChange("showMyIdNumber", e.value)
                        }
                        options={visibilityOptions}
                      />
                    </Col>
                  </Row>
                  <hr />
                  <Row className="align-items-center mb-3">
                    <Col lg="6" sm="12">
                      <Label className="form-label  mb-0">
                        Show my nickname
                      </Label>
                    </Col>
                    <Col lg="6" sm="12">
                      <Select
                        value={valueOf("showMyNickname")}
                        onChange={(e) =>
                          this.handleChange("showMyNickname", e.value)
                        }
                        options={visibilityOptions}
                      />
                    </Col>
                  </Row>
                  <hr />
                  <Row className="align-items-center mb-3">
                    <Col lg="6" sm="12">
                      <Label className="form-label  mb-0">
                        Show my avatar
                      </Label>
                    </Col>
                    <Col lg="6" sm="12">
                      <Select
                        value={valueOf("showMyAvatar")}
                        onChange={(e) =>
                          this.handleChange("showMyAvatar", e.value)
                        }
                        options={visibilityOptions}
                      />
                    </Col>
                  </Row>
                  <hr />
                  <Row className="align-items-center mb-3">
                    <Col lg="6" sm="12">
                      <Label className="form-label  mb-0">
                        Option of finding via search
                      </Label>
                    </Col>
                    <Col lg="6" sm="12">
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-muted" style={{ fontSize: 12, fontWeight: 700 }}>
                          No
                        </span>
                        <div className="form-check form-switch m-0">
                          <Input
                            type="switch"
                            checked={settings.findableBySearch}
                            onChange={(e) =>
                              this.handleChange("findableBySearch", e.target.checked)
                            }
                          />
                        </div>
                        <span className="text-muted" style={{ fontSize: 12, fontWeight: 700 }}>
                          Yes
                        </span>
                      </div>
                    </Col>
                  </Row>
                  {/* Save Button */}
                  <Button
                    className="btn cryto-btn savebtn w-100 mt-4"
                    onClick={this.saveSettings}
                  >
                    Save Visibility Settings
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>

        </Container>
      </div>
    );
  }
}

VisibilitySettings.propTypes = {
  user: PropTypes.object,
  updateUserSettings: PropTypes.func.isRequired,
};

const mapStateToProps = ({ User }) => ({
  user: User.user,
});

export default withRouter(
  connect(mapStateToProps, { updateUserSettings })(VisibilitySettings)
);
