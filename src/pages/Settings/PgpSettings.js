import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Container,
  Row,
  Col,
  Card,
  CardBody
} from "reactstrap";
import withRouter from "../../components/Common/withRouter";
import { toast } from "react-toastify";
import copyIcon from "../../assets/images/auth/copy_icon.png";
import saveIcon from "../../assets/images/auth/save_icon.png";

class PgpKeysSettings extends Component {
  constructor(props) {
    super(props);

    const identity = props.user?.identity || {};

    this.state = {
      loadingPublic: false,
      loadingPrivate: false,
      modals: {
        publicKey: false,
        privateKey: false,
        shareQr: false,
        shareLink: false,
      },
      pgpPublicKey: identity.pgpPublicKey || "",
      pgpPrivateKey: identity.pgpPrivateKey || "",
      pgpPublicKeyQRCode: identity.pgpPublicKeyQRCode || "",
      shareLink: identity.pgpPublicKeyQRCode,
      privateVisible: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user && this.props.user) {
      const identity = this.props.user?.identity || {};
      this.setState({
        pgpPublicKey: identity.pgpPublicKey || "",
        pgpPrivateKey: identity.pgpPrivateKey || "",
        pgpPublicKeyQRCode: identity.pgpPublicKeyQRCode || "",
      });
    }
  }

  openModal = (key) => this.setState((p) => ({ modals: { ...p.modals, [key]: true } }));
  closeModal = (key) => this.setState((p) => ({ modals: { ...p.modals, [key]: false } }));

  copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (e) {
      toast.error("Copy failed (browser blocked clipboard)");
    }
  };

  downloadTextFile = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  downloadQrImage = async (imageUrl, filename = "pgp-public-key-qr.png") => {
    try {
      const res = await fetch(imageUrl, { mode: "cors" });
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Failed to download QR image");
    }
  };

  generateShareLink = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/pgp/share-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed");
      this.setState({ shareLink: json.link || "" });
    } catch (e) {
      toast.error(e.message || "Failed to generate link");
    }
  };

  // ---------------------------
  // actions
  // ---------------------------
  onShowPublicKey = async () => {
    this.openModal("publicKey");
  };

  onShowPrivateKey = async () => {
    this.openModal("privateKey");
  };

  onShareQr = async () => {
    this.openModal("shareQr");
  };

  onShareLink = async () => {
    // If you want to generate a link each time:
    // await this.generateShareLink();
    this.openModal("shareLink");
  };

  renderKeyRow({ label, onDownload, onCopy, onShow, showText = "Show", loading = false }) {
    return (
      <div className="d-flex align-items-center justify-content-between py-3 gap-2">
        <div>
          <div className="fw-bold" style={{ fontSize: 13 }}>
            {label}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            title="Download"
            className="btn p-0 bg-transparent border-0"
            disabled={!onDownload}
          >
            <img
              src={saveIcon}
              alt="save"
              className={onDownload ? "" : "opacity-50"}
            />
          </button>

          <button
            type="button"
            onClick={onCopy}
            title="Copy"
            className="btn p-0 bg-transparent border-0"
            disabled={!onCopy}
          >
            <img
              src={copyIcon}
              alt="copy"
              className={onCopy ? "" : "opacity-50"}
            />
          </button>

          <Button className="btn cryto-btn btn-sm" onClick={onShow} disabled={loading}>
            {loading ? "Loading..." : showText}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      modals,
      pgpPublicKey,
      pgpPrivateKey,
      pgpPublicKeyQRCode,
      shareLink,
      privateVisible,
      loadingPublic,
      loadingPrivate,
    } = this.state;

    return (
      <div className="Bitcoin-content py-3">
        <Container fluid className="step-back settings p-2">
          <Row>
            <Col lg={12}>
              <h1 className="text-muted">PGP Keys</h1>
              <Card>
                <CardBody>
                  <div>
                    <h6 className="id-color mb-4">
                      Key Management
                    </h6>

                    {this.renderKeyRow({
                      label: "View Public Key",
                      loading: loadingPublic,
                      onShow: this.onShowPublicKey,
                      onCopy: pgpPublicKey ? () => this.copyToClipboard(pgpPublicKey) : null,
                      onDownload: pgpPublicKey ? () => this.downloadTextFile(pgpPublicKey, "publickey.txt") : null,
                    })}

                    {this.renderKeyRow({
                      label: "View Private Key",
                      loading: loadingPrivate,
                      onShow: this.onShowPrivateKey,
                      onCopy: pgpPrivateKey ? () => this.copyToClipboard(pgpPrivateKey) : null,
                      onDownload: pgpPrivateKey ? () => this.downloadTextFile(pgpPrivateKey, "privatekey.txt") : null,
                    })}
                  </div>
                </CardBody>
              </Card>
              <hr className="m-0" />
              <Card>
                <CardBody>
                  <div>
                    <h6 className="id-color mb-4">
                      Public Key sharing Options
                    </h6>

                    <div className="d-flex align-items-center justify-content-between py-3">
                      <div className="fw-bold" style={{ fontSize: 13 }}>
                        Share QR code
                      </div>
                      <Button className="btn cryto-btn btn-sm" onClick={this.onShareQr}>
                        Share QR
                      </Button>
                    </div>

                    <div className="d-flex align-items-center justify-content-between py-3">
                      <div className="fw-bold" style={{ fontSize: 13 }}>
                        Share via Link
                      </div>
                      <Button className="btn cryto-btn btn-sm" onClick={this.onShareLink}>
                        Generate Link
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
              {/* Public Key Modal */}
              <Modal isOpen={modals.publicKey} toggle={() => this.closeModal("publicKey")} centered size="md">
                <ModalHeader toggle={() => this.closeModal("publicKey")}>Public Key</ModalHeader>
                <ModalBody>
                  <div className="bg-white rounded-3 p-3 border small font-monospace text-break" style={{ whiteSpace: "pre-wrap" }}>
                    {pgpPublicKey || "No public key found."}
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      className="btn cryto-btn btn-sm"
                      onClick={() => this.copyToClipboard(pgpPublicKey)}
                      disabled={!pgpPublicKey}
                    >
                      Copy
                    </Button>
                    <Button
                      className="btn cryto-btn btn-sm"
                      onClick={() => this.downloadTextFile(pgpPublicKey, "publickey.txt")}
                      disabled={!pgpPublicKey}
                    >
                      Download
                    </Button>
                  </div>
                </ModalBody>
              </Modal>

              {/* Private Key Modal */}
              <Modal isOpen={modals.privateKey} toggle={() => this.closeModal("privateKey")} centered size="md">
                <ModalHeader toggle={() => this.closeModal("privateKey")}>Private Key</ModalHeader>
                <ModalBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-muted fw-bold small">Sensitive content</div>
                    <Button
                      className="btn cryto-btn btn-sm"
                      onClick={() => this.setState((p) => ({ privateVisible: !p.privateVisible }))}
                    >
                      {privateVisible ? "Hide" : "Show"}
                    </Button>
                  </div>

                  <div
                    className="mt-3 bg-white rounded-3 p-3 border small font-monospace text-break"
                    style={{ whiteSpace: "pre-wrap", minHeight: 120 }}
                  >
                    {privateVisible
                      ? pgpPrivateKey || "No private key found."
                      : "•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••"}
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      className="btn cryto-btn btn-sm"
                      onClick={() => this.copyToClipboard(pgpPrivateKey)}
                      disabled={!pgpPrivateKey}
                    >
                      Copy
                    </Button>
                    <Button
                      className="btn cryto-btn btn-sm"
                      onClick={() => this.downloadTextFile(pgpPrivateKey, "privatekey.asc")}
                      disabled={!pgpPrivateKey}
                    >
                      Download
                    </Button>
                  </div>
                </ModalBody>
              </Modal>

              {/* Share QR Modal */}
              <Modal isOpen={modals.shareQr} toggle={() => this.closeModal("shareQr")} centered>
                <ModalHeader toggle={() => this.closeModal("shareQr")}>Share Public Key (QR)</ModalHeader>
                <ModalBody>
                  {!pgpPublicKeyQRCode ? (
                    <div className="text-muted small">
                      QR not available. Generate it on backend and store URL in identity.
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center">
                      <img
                        src={pgpPublicKeyQRCode}
                        alt="PGP Public Key QR"
                        className="rounded-3 border"
                        width={260}
                        height={260}
                      />

                      <Button
                        className="btn cryto-btn btn-sm mt-2"
                        onClick={() => this.downloadQrImage(pgpPublicKeyQRCode, "pgp-public-key-qr.png")}
                      >
                        Download QR
                      </Button>
                    </div>
                  )}
                </ModalBody>
              </Modal>

              {/* Share Link Modal */}
              <Modal isOpen={modals.shareLink} toggle={() => this.closeModal("shareLink")} centered>
                <ModalHeader toggle={() => this.closeModal("shareLink")}>Share via Link</ModalHeader>
                <ModalBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    {shareLink || "No link generated yet."}
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      className="btn cryto-btn w-100"
                      onClick={() => this.copyToClipboard(shareLink)}
                      disabled={!shareLink}
                    >
                      Copy
                    </Button>
                  </div>
                </ModalBody>
              </Modal>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

PgpKeysSettings.propTypes = {
  user: PropTypes.object,
};

const mapStateToProps = ({ User }) => ({
  user: User.user,
});

export default withRouter(connect(mapStateToProps, {})(PgpKeysSettings));
