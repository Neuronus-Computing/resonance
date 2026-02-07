// src/pages/Settings/MenuManagementSettings.js
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Label, Input, Button, Modal, ModalHeader, ModalBody, Container, Row, Col } from "reactstrap";
import withRouter from "../../components/Common/withRouter";
import { toast } from "react-toastify";
import { dateFormatByFlags } from "../../util/dateTime";
import {
  updateUserSettings,
  fetchMenuManagement,
  addMenuSlot,
  removeMenuSlot,
  getContacts,
  getGroups,
} from "../../store/actions";

class MenuManagementSettings extends Component {
  constructor(props) {
    super(props);

    const s = props.user?.identity?.settings || {};
    const m = props.menu || {};

    this.state = {
      settings: {
        sidebarItems: s.menuSidebarItems || {
          messages: true,
          finance: true,
          settings: true,
        },
        menuApplicationId: s.menuApplicationId || m.tools[0]?.id || "",
        compactSidebar: s.menuCompactSidebar ?? false,
        autoHideSidebar: s.menuAutoHideSidebar ?? false,
      },

      addModalOpen: false,
      addTab: "wallet",
      selectedItem: null,
    };
  }

  componentDidMount() {
    this.props.fetchMenuManagement();
    this.props.getContacts();
    this.props.getGroups();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.menu !== this.props.menu) {
      const tools = this.props.menu?.tools || [];
      if (!this.state.settings.menuApplicationId && tools.length) {
        this.setState((prev) => ({
          settings: { ...prev.settings, menuApplicationId: tools[0].id },
        }));
      }
    }
    if (prevProps.user !== this.props.user && this.props.user) {
      const s = this.props.user?.identity?.settings || {};
      this.setState((prev) => ({
        settings: {
          ...prev.settings,
          sidebarItems: s.menuSidebarItems || {
            messages: true,
            finance: true,
            settings: true,
          },
          menuApplicationId: s.menuApplicationId || prev.settings.menuApplicationId || "",
          compactSidebar: s.menuCompactSidebar ?? false,
          autoHideSidebar: s.menuAutoHideSidebar ?? false,
        },
      }));
    }
  }
  handleSettingChange = (key, value) => {
    this.setState((prev) => ({
      settings: { ...prev.settings, [key]: value },
    }));
  };
  toggleSidebarItem = (key) => {
    this.setState((prev) => ({
      settings: {
        ...prev.settings,
        sidebarItems: {
          ...prev.settings.sidebarItems,
          [key]: !prev.settings.sidebarItems[key],
        },
      },
    }));
  };
  saveSettings = () => {
    const { settings } = this.state;

    if (!settings.menuApplicationId) {
      return toast.error("Please select an Application Slot tool.");
    }

    this.props.updateUserSettings({
      menuSidebarItems: settings.sidebarItems,
      menuApplicationId: settings.menuApplicationId,
      menuCompactSidebar: settings.compactSidebar,
      menuAutoHideSidebar: settings.autoHideSidebar,
    });
  };

  openAddModal = () =>
    this.setState({ addModalOpen: true, addTab: "wallet", selectedItem: null });

  closeAddModal = () => this.setState({ addModalOpen: false, selectedItem: null });

  setAddTab = (tab) => this.setState({ addTab: tab, selectedItem: null });

  selectItem = (type, item) =>
    this.setState({ selectedItem: { type, id: item.id, data: item } });

  addSelectedSlot = () => {
    const { selectedItem } = this.state;
    if (!selectedItem) return toast.error("Select an item first.");

    const payload = { type: selectedItem.type };
    if (selectedItem.type === "tool") payload.toolId = selectedItem.id;
    if (selectedItem.type === "wallet") payload.walletId = selectedItem.id;
    if (selectedItem.type === "contact") payload.contactIdentityId = selectedItem.id;

    this.props.addMenuSlot(payload, () => {
      this.props.fetchMenuManagement();
      this.closeAddModal();
    });
  };

  removeSlot = (slotId) => {
    this.props.removeMenuSlot(slotId);
  };

  renderSlotsList() {
    const slots = this.props.menu?.slots || [];
    if (!slots.length) {
      return <div className="text-muted small">No slots added yet.</div>;
    }
    return (
      <div className="list-group">
        {slots.map((slot) => {
          const title =
            slot?.label ||
            slot?.tool?.name ||
            slot?.wallet?.label ||
            slot?.wallet?.coin ||
            slot?.contact?.name ||
            slot?.contact?.nickname ||
            "Slot";
          const icon = slot.tool?.image || slot.wallet?.image || slot.contact?.avatar || null;
          return (
            <>
            <div
              key={slot.id}
              className="d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center gap-2">
                {icon ? (
                  <img
                    src={icon}
                    alt=""
                    className="rounded"
                    style={{ width: 32, height: 32, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded bg-light d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32 }}
                  >
                    •
                  </div>
                )}

                <div>
                  <div className="fw-bold">{title}</div>
                  <div className="text-muted small">{slot.type}</div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => this.removeSlot(slot.id)}
              >
                Remove
              </button>
            </div>
            <hr/>
            </>
          );
        })}
      </div>
    );
  }

  renderPickerGrid() {
    const { addTab, selectedItem } = this.state;
    const tools = this.props.menu?.tools || [];
    const wallets = this.props.user?.identity?.wallets || [];
    const contacts = (this.props.chats || []).filter(chat => chat.type === "contact");
    const settings = this.props.user?.identity?.settings || {};
    let type = "wallet";
    let list = [];

    if (addTab === "wallet") {
      type = "wallet";
      list = wallets.map((w) => ({
        id: w.id,
        name: w.label || w.coin || "Wallet",
        image: w.image || null,
        badge: w.coin || "",
        raw: w,
      }));
    } else if (addTab === "message") {
      type = "contact";
      list = contacts.map((c) => ({
        id: c.identityId || c.id,
        name: c.nickname || c.name || c.address,
        image: c.avatar || null,
        badge: "",
        raw: c,
        lastMessage: c.message ?? "",
        lastMessageTimestamp: c.lastMessageTimestamp ?? null,
      }));
    } else {
      type = "tool";
      list = tools.map((t) => ({
        id: t.id,
        name: t.name,
        image: t.image,
        badge: t.isOpenLink ? "Open Link" : "",
        raw: t,
      }));
    }
    if (!list.length) return <div className="text-muted small mt-3">No items found.</div>;
    return (
      <div className="row g-2 mt-2">
        {list.map((it) => {
          const active = selectedItem?.type === type && selectedItem?.id === it.id;
          return (
            <div className="col-12" key={`${type}-${it.id}`}>
              <button
                type="button"
                onClick={() => this.selectItem(type, { id: it.id, ...it.raw })}
                className={`w-100 text-start btn ${active ? "btn-primary" : "btn-outline-secondary"}`}
                style={{ borderRadius: 12 }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    {it.image ? (
                      <img
                        src={it.image}
                        alt=""
                        className="rounded-circle"
                        style={{ width: 28, height: 28, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                        style={{ width: 28, height: 28 }}
                      >
                        <span className="fw-bold small">{it.name?.[0] || "•"}</span>
                      </div>
                    )}
                    <div className="fw-bold small">{it.name}</div>
                  </div>
                  {it.lastMessage?.content ? (
                    <>
                      <div>
                        {it.lastMessage.content.length > 16
                          ? `${it.lastMessage.content.substring(0, 16)}...`
                          : it.lastMessage.content}
                      </div>
                      <div className="text-muted small">
                        {dateFormatByFlags(it.lastMessageTimestamp, settings, false, false, true, false, false, settings?.timeFormat)}
                      </div>
                    </>
                  ) : null}
                  {it.badge ? (
                    <span className={`badge ${active ? "bg-light text-dark" : "bg-secondary"}`}>
                      {it.badge}
                    </span>
                  ) : null}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    );
  };
  resetLayoutToDefault = () => {
    this.setState(
      (prev) => ({
        settings: {
          ...prev.settings,
          compactSidebar: false,
          autoHideSidebar: false,
        },
      }),
      () => {
        const { settings } = this.state;
        this.props.updateUserSettings({
          menuSidebarItems: {
            messages: true,
            finance: true,
            settings: true,
          },
          menuApplicationId: settings.menuApplicationId,
          menuCompactSidebar: false,
          menuAutoHideSidebar: false,
        });
      }
    );
  };
  render() {
    const { settings, addModalOpen, addTab, selectedItem } = this.state;
    const tools = this.props.menu?.tools || [];
    return (
      <div className="Bitcoin-content py-3">
        <Container fluid={true} className="step-back settings p-2">
          <Row>
            <Col lg={12} className="">        
              <h1 className="text-muted">MENU MANAGEMENT</h1>
              <div className="card mt-3 shadow-sm">
                <div className="card-body">
                  <div className="fw-bold mb-2 id-color">Sidebar Items</div>
                  {["messages", "finance", "settings"].map((key, idx) => (
                    <div
                      key={key}
                      className={`d-flex align-items-center justify-content-between py-2 ${idx !== 2 ? "border-bottom" : ""
                        }`}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted">⋮⋮</span>
                        <div className="fw-semibold text-capitalize">{key}</div>
                      </div>
                      <div className="form-check form-switch m-0">
                        <Input
                          type="switch"
                          checked={!!settings.sidebarItems?.[key]}
                          onChange={() => this.toggleSidebarItem(key)}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <Label className="form-label mb-0">Application Slot</Label>
                    <select
                      className="form-select form-select-sm w-auto"
                      value={settings.menuApplicationId}
                      onChange={(e) => this.handleSettingChange("menuApplicationId", e.target.value)}
                      disabled={!tools.length}
                    >
                      {!tools.length ? (
                        <option value="">No tools available</option>
                      ) : (
                        tools.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>
              <div className="card mt-3 shadow-sm">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-bold id-color">Add position / f(x) / slot</div>
                    <div className="text-muted small">
                      You can add another Application Slot or even Contact from messenger, or crypto wallet etc
                    </div>
                  </div>
                  <Button className="btn cryto-btn btn-sm p-2 "  onClick={this.openAddModal}>
                    + Add Slot
                  </Button>
                </div>
              </div>
              <div className="card mt-3 shadow-sm">
                <div className="card-body">
                  <div className="fw-bold mb-2 id-color">Your Slots</div>
                  {this.renderSlotsList()}
                </div>
              </div>
              <div className="card mt-3 shadow-sm">
                <div className="card-body">
                  <div className="fw-bold mb-2 id-color">Layout Options</div>
                  <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                    <div className="fw-semibold">Compact mode (icons only)</div>
                    <div className="form-check form-switch m-0">
                      <Input
                        type="switch"
                        checked={!!settings.compactSidebar}
                        onChange={(e) => this.handleSettingChange("compactSidebar", e.target.checked)}
                      />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between py-2">
                    <div className="fw-semibold">Auto-hide sidebar</div>
                    <div className="form-check form-switch m-0">
                      <Input
                        type="switch"
                        checked={!!settings.autoHideSidebar}
                        onChange={(e) => this.handleSettingChange("autoHideSidebar", e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="fw-bold mb-2 id-color">Reset</div>
                  <Button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={this.resetLayoutToDefault}
                  >
                    <i className="ri-refresh-line me-2" />
                    Reset to Default Layout
                  </Button>
                </div>
              </div>
              <hr />
              <Button className="btn cryto-btn savebtn w-100 mt-2" onClick={this.saveSettings}>
                Save Settings
              </Button>
              <Modal isOpen={addModalOpen} toggle={this.closeAddModal} centered>
                <ModalHeader toggle={this.closeAddModal}>Add position / f(x) / slot</ModalHeader>
                <ModalBody>
                  <div className="text-muted small">
                    Let us know what you want to add into the sidebar shortcut.
                  </div>
                  <ul className="nav nav-tabs mt-3">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${addTab === "wallet" ? "active" : ""}`}
                        onClick={() => this.setAddTab("wallet")}
                      >
                        Wallet
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${addTab === "message" ? "active" : ""}`}
                        onClick={() => this.setAddTab("message")}
                      >
                        Message
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${addTab === "application" ? "active" : ""}`}
                        onClick={() => this.setAddTab("application")}
                      >
                        Applications
                      </button>
                    </li>
                  </ul>
                  {this.renderPickerGrid()}
                  <Button
                    className="btn cryto-btn savebtn w-100 mt-3"
                    onClick={this.addSelectedSlot}
                    disabled={!selectedItem}
                  >
                    + Add Slot
                  </Button>
                </ModalBody>
              </Modal>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
MenuManagementSettings.propTypes = {
  user: PropTypes.object,
  menu: PropTypes.object,
  chats: PropTypes.array,

  fetchMenuManagement: PropTypes.func.isRequired,
  addMenuSlot: PropTypes.func.isRequired,
  removeMenuSlot: PropTypes.func.isRequired,
  updateUserSettings: PropTypes.func.isRequired,

  getContacts: PropTypes.func,
  getGroups: PropTypes.func,
};

const mapStateToProps = ({ chat, User, menu }) => ({
  user: User.user,
  chats: chat?.chats || [],
  menu: menu,
});

export default withRouter(
  connect(mapStateToProps, {
    fetchMenuManagement,
    addMenuSlot,
    removeMenuSlot,
    updateUserSettings,
    getContacts,
    getGroups,
  })(MenuManagementSettings)
);
