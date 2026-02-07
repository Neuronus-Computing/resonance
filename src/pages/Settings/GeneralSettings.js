import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Tooltip } from "react-tooltip";
import {
  Label,
  Input,
  Button,
  Container,
  Row,
  Col
} from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import withRouter from "../../components/Common/withRouter";
import {
  updateNickname,
  updateUserSettings,
  changeLayoutTheme
} from "../../store/actions";

class GeneralSettings extends Component {
  constructor(props) {
    super(props);
    const user = props.user || {};
    const identitySettings = user?.identity?.settings || {};
    this.state = {
      user,
      nickname: user?.identity?.nickname || "",
      settings: {
        language: identitySettings?.language || "en",
        currency: identitySettings?.currency || "USD",
        dateFormat: identitySettings?.dateFormat || "DD/MM/YYYY",
        timeFormat: identitySettings?.timeFormat || "12",
        autoLogoutMinutes: identitySettings?.autoLogoutMinutes === 1440 ? 24 : identitySettings?.autoLogoutMinutes || 10,
        notifications: identitySettings?.notifications || {
          escrowAlerts: true,
          depositAlerts: true,
          withdrawaAlerts: true,
        },
        status: identitySettings?.status || "offline",
        theme: identitySettings.theme || "light"
      }
    };
    this.handleNicknameChange = this.handleNicknameChange.bind(this);
  }
  handleSettingChange = (key, value) => {
    this.setState(prev => ({
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  toggleNotification = (key) => {
    this.setState(prev => ({
      settings: {
        ...prev.settings,
        notifications: {
          ...prev.settings.notifications,
          [key]: !prev.settings.notifications[key]
        }
      }
    }));
  };

  saveSettings = () => {
    const { settings, nickname } = this.state;
    this.props.updateUserSettings(
      {
        ...settings,
        nickname
      },
      () => {
        this.props.changeLayoutTheme(settings.theme);
        localStorage.setItem("theme", settings.theme);
      }
    );
  };

  handleNicknameChange(event) {
    let value = event.target.value;
    const regex = /^[a-zA-Z0-9-_]*$/;
    if (regex.test(value) || value === "") {
      this.setState({ nickname: value });
    } else {
      toast.error("Only letters, numbers, hyphens, and underscores are allowed.");
    }
  }
  handleUpdateNickname(event) {
    event.preventDefault();
    const { nickname } = this.state;
    if (!nickname.trim()) {
      toast.error("Nickname cannot be empty.");
      return;
    }
    this.props.updateNickname(nickname.trim(), (nickname) => {
      this.setState({
        nickname: nickname,
        user: {
          ...this.state.user,
          identity: {
            ...this.state.user.identity,
            nickname: nickname
          }
        }
      });
    });
  }
  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user && this.props.user) {
      const user = this.props.user;
      this.setState(prev => ({
        settings: {
          ...prev.settings,
          status: user?.identity?.settings?.status || "offline"
        },
        nickname: user?.identity?.nickname || prev.nickname
      }));
    }
  }
  render() {
    const { user, nickname, settings } = this.state;
    const statusOptions = [
      { label: "Available", value: "available" },
      { label: "Busy", value: "busy" },
      { label: "Away", value: "away" },
      { label: "Invisible", value: "invisible" },
      { label: "Offline", value: "offline" },
      { label: "Only Important", value: "only_important" },
    ];
    const logoutOptions = [
      { label: "After 10 Minutes", value: 10 },
      { label: "After 30 minutes", value: 30 },
      { label: "After 60 minutes", value: 60 },
      { label: "After 24 hours", value: 24 }
    ];
    const themes = [
      { label: "Quantum Violet", value: "quantum_violet", color: "#5B21B6" },
      { label: "Glitch Blue", value: "light", color: "#2563EB" },
      { label: "Gotham Black", value: "dark", color: "#111827" },
      { label: "Neon Ember", value: "neon_ember", color: "#F97316" },
      { label: "Barbie", value: "barbie", color: "#EC4899" },
    ];
    const themeOptions = themes.map(t => ({
      label: t.label.charAt(0).toUpperCase() + t.label.slice(1),
      value: t.value,
      color: t.color
    }));
    return (
      <div className="Bitcoin-content py-3">
        <Container fluid={true} className="step-back settings p-2">
          <Row>
            <Col lg={12} className="">
              <h1 className="text-muted">GENERAL</h1>
              <div className="id-mar">
                <Label className="form-label id-color">Nickname</Label>
                <div className="input-with-icon id-input">
                  <Input
                    type="text"
                    className="form-control"
                    id="nickname"
                    value={nickname}
                    onChange={this.handleNicknameChange}
                    placeholder="Enter your nickname"
                  />
                </div>
              </div>
              <div className="id-mar">
                <Label className="form-label id-color">Status</Label>
                <Select
                  value={statusOptions.find(opt => opt.value === settings.status) || statusOptions[1]}
                  onChange={(e) => this.handleSettingChange("status", e.value)}
                  options={statusOptions}
                />
              </div>
              <Row>
                <Col md={6} sm={12} className="id-mar">
                  <Label className="form-label id-color">Language</Label>
                  <Select
                    value={{ label: settings.language.toUpperCase(), value: settings.language }}
                    onChange={(e) => this.handleSettingChange("language", e.value)}
                    options={[{ label: "EN", value: "en" }]}
                  />
                </Col>
                <Col md={6} sm={12} className="id-mar">
                  <Label className="form-label id-color">Currency display</Label>
                  <Select
                    value={{ label: settings.currency, value: settings.currency }}
                    onChange={(e) => this.handleSettingChange("currency", e.value)}
                    options={[
                      { label: "USD", value: "USD" },
                      { label: "EUR", value: "EUR" },
                    ]}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6} sm={12} className="id-mar">
                  <Label className="form-label id-color">Date Format</Label>
                  <Select
                    value={{ label: settings.dateFormat, value: settings.dateFormat }}
                    onChange={(e) => this.handleSettingChange("dateFormat", e.value)}
                    options={[
                      { label: "DD MMM YYYY", value: "DD MMM YYYY" },
                      { label: "DD MMM", value: "DD MMM" },
                      { label: "DD.MM.YYYY", value: "DD.MM.YYYY" },
                      { label: "MM/DD/YY", value: "MM/DD/YY" },
                    ]}
                  />
                </Col>
                <Col md={6} sm={12} className="id-mar">
                  <Label className="form-label id-color">Time Format</Label>
                  <Select
                    value={{ label: settings.timeFormat, value: settings.timeFormat }}
                    onChange={(e) => this.handleSettingChange("timeFormat", e.value)}
                    options={[
                      { label: "12 hours", value: "12" },
                      { label: "24 hours", value: "24" },

                    ]}
                  />
                </Col>
              </Row>
              <Label className="form-label id-color">Resonance Themes</Label>
              <Select
                value={themeOptions.find(opt => opt.value === settings.theme)}
                onChange={e => this.handleSettingChange("theme", e.value)}
                options={themeOptions}
                styles={{
                  singleValue: (provided, state) => ({
                    ...provided,
                    color: state.data.color
                  })
                }}
              />
              <hr />
              <div className="row d-flex align-items-center mb-2 p-2">
                <h4 className="form-label id-color">Notifications</h4>
                <div className="row d-flex ">
                  {Object.keys(settings.notifications).map(key => (
                    <div className="col-sm-12 col-md-4 mb-2" key={key}>
                      <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                        <Label className="id-color m-0">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <div className="form-check form-switch m-0">
                          <Input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={settings.notifications[key]}
                            onChange={() => this.toggleNotification(key)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <hr />
              <Label className="mt-2">Default auto-logout-timer</Label>
              <Select
                value={{ label: settings.autoLogoutMinutes, value: settings.autoLogoutMinutes }}
                onChange={(e) => this.handleSettingChange("autoLogoutMinutes", e.value)}
                options={logoutOptions}
              />
              <Button
                className="btn cryto-btn savebtn w-100 mt-3"
                onClick={this.saveSettings}
              >
                Save Settings
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

GeneralSettings.propTypes = {
  user: PropTypes.object
};

const mapStateToProps = ({ User }) => ({
  user: User.user
});

const mapDispatchToProps = {
  updateNickname,
  updateUserSettings,
  changeLayoutTheme
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(GeneralSettings)
);
