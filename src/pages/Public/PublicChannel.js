import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { connect } from "react-redux";
import withRouter from "../../components/Common/withRouter";
import PropTypes from "prop-types";
import channelAvatar from "../../assets/images/channel-avatar.svg";
import { toast } from "react-toastify";
import { 
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import {
  getChannelMessages, getFollowChannel
} from "../../store/actions";


class PublicChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: null,
      messages: this.props.messages || [],
      isMediaModalOpen:false,
      selectedMedia: { url: "", type: "" },
    };
  }
  componentDidMount() {
    const { router } = this.props;
    const { channelName } = router.params || {};
    if (channelName) {
      const { onGetChannelMessages } = this.props;
      onGetChannelMessages(channelName,
        (selectedchannel) => {
          this.setState({
            channel: selectedchannel
          });
        });
    } else {
      console.log(router, 'channelName is not defined');
    }

  }
  followChannel = () => {
    const { router } = this.props;
    const { channelName } = router.params || {};
    if (channelName) {
      const { onGetFollowChannel } = this.props;
      onGetFollowChannel(channelName, (selectedchannel, login = null) => {
        if (login) {
          this.props.router.navigate("/login")
        }
        this.setState({
          channel: selectedchannel,
        });
      });
    }
  }
  openMediaModal = (url, type) => {
    this.setState({ isMediaModalOpen: true, selectedMedia: { url, type } });
  };
  
  closeMediaModal = () => {
    this.setState({ isMediaModalOpen: false, selectedMedia: { url: "", type: "" } });
  };
  handleDownload = (url, messageId, fileName) => {
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a); 
      toast.success(`Attachment downloded successfully.`);
    }else{
      toast.error("Download failed. Please try again.");
    }
  };
  getMessagesGroupedByDate = (messages, searchQuery = '') => {
    let filteredMessages = messages;
    if (searchQuery.trim()) {
      filteredMessages = messages.filter(
        (message) =>
          message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (message.fileName &&
            message.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filteredMessages.reduce((acc, message) => {
      const date = moment(message.createdAt).format('ddd, DD MMMM YYYY');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
  };

  render() {
    const { router } = this.props;
    const { channelName } = router.params || {};
    let messages = this.props.messages || [];
    const { channel,isMediaModalOpen,selectedMedia} = this.state;
    const messagesGroupedByDate = this.getMessagesGroupedByDate(messages);
    return (
      <div className="main-channel-pub-cls" >
        {channel ? (
          <>
            <header id="page-topbar-channel" className='w-100 main-channel-topbar'>
              <div className='container'>
                <div className="navbar-header">
                  <div className="d-flex align-items-center">
                    <div className="navbar-brand-box-top">
                      <img src={channel.avatar ? channel.avatar : channelAvatar} className="h-100" alt="channel logo" />
                    </div>
                    <div className='name'>
                      <strong> {channel.name} </strong>
                      <div className="subscribers mb-0">
                        Members: <span>{channel.members}</span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <Link
                      onClick={() => this.followChannel(channelName)}
                      className="btn cryto-btn"
                    >
                      <span className='mobile-show'>
                        <i className='fas fa-paper-plane' style={{ paddingRight: '6px' }}></i> Follow
                      </span>
                      <span className='desktop-show'>
                        Follow in Resonance
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </header>
            <div className='w-100 pt-1 container'>
              <PerfectScrollbar className="chat-conversation-height-cls">
                <div className="chat-conversation p-3">
                  <ul className="list-unstyled mb-0">
                    <PerfectScrollbar className="main-point-cls">
                      {Object.keys(messagesGroupedByDate).length > 0 ? (
                        Object.keys(messagesGroupedByDate).map((date, idx) => (
                          <React.Fragment key={idx}>
                            <li className="text-center">{date}</li>
                            {messagesGroupedByDate[date].map((message, key) => (
                              <li
                                key={key}
                                className=""
                                style={{ paddingRight: '20px' }}
                              >
                                <div className="conversation-list">
                                  <div className="ctext-wrap">
                                    <p className="chat-time mb-0">
                                      {moment(message.createdAt).format(
                                        'hh:mm A'
                                      )}
                                    </p>
                                    <div className="ctext-wrap-content">
                                      {message.fileUrl && message.fileType === "image" && (
                                        <div>
                                          <img
                                            src={message.fileUrl}
                                            alt={message.fileName || "Image"}
                                            style={{
                                              maxWidth: "150px",
                                              maxHeight: "150px",
                                              cursor: "pointer",
                                            }}
                                            data-tooltip-id="tooltip"
                                            data-tooltip-content="View image."
                                            onClick={() => this.openMediaModal(message.fileUrl, "image")}
                                            onContextMenu={(e) =>
                                              this.showContextMenu(
                                                e,
                                                message.id,
                                                message.fileUrl,
                                                "image",
                                                message.fileName
                                              )
                                            }
                                          />
                                          <p className="mb-0">{message.content}</p>
                                        </div>
                                      )}

                                      {message.fileUrl && message.fileType === "video" && (
                                        <div>
                                          <video
                                            src={message.fileUrl}
                                            controls
                                            style={{
                                              maxWidth: "200px",
                                              maxHeight: "150px",
                                              cursor: "pointer",
                                            }}
                                            // onContextMenu={(e) =>
                                            //   this.showContextMenu(
                                            //     e,
                                            //     message.id,
                                            //     message.fileUrl,
                                            //     "video",
                                            //     message.fileName
                                            //   )
                                            // }
                                          />
                                          <p className="mb-0">{message.content}</p>
                                        </div>
                                      )}

                                      {message.fileUrl && message.fileType === "document" && (
                                        <div
                                          className="document-container"
                                          onClick={() => this.handleDownload(message.fileUrl,message.id,message.fileName)}
                                          // onContextMenu={(e) =>
                                          //   this.showContextMenu(
                                          //     e,
                                          //     message.id,
                                          //     message.fileUrl,
                                          //     "document",
                                          //     message.fileName
                                          //   )
                                          // }
                                          style={{ cursor: "pointer" }}
                                        >
                                          <i className="fa fa-file" style={{ fontSize: "40px" }}></i>
                                          <p className="mb-0">{message.fileName}</p>
                                          <p className="mb-0">{message.content}</p>
                                        </div>
                                      )}

                                      {(!message.fileUrl || !["image", "video", "document"].includes(message.fileType)) && (
                                        <p className="mb-0">{message.content}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </React.Fragment>
                        ))
                      ) : (
                        <li className="text-center">No messages to display.</li>
                      )}
                    </PerfectScrollbar>
                  </ul>
                </div>
              </PerfectScrollbar>
              {isMediaModalOpen && (
                <Modal isOpen={isMediaModalOpen} toggle={this.closeMediaModal} className="modal-dialog-centered modal-lg">
                  <div className="bg-modal">
                    <ModalHeader className="modal-header-custom pb-1 mb-3">
                      <button type="button" className="close" data-dismiss="modal"  aria-label="Close" onClick={this.closeMediaModal}>
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </ModalHeader>
                    <ModalBody className="custom-modal-body">
                      {selectedMedia.type === "image" && (
                        <img src={selectedMedia.url} alt="Preview" style={{ width: "100%" }} />
                      )}
                      {selectedMedia.type === "video" && (
                        <video controls autoPlay src={selectedMedia.url} style={{ width: "100%" }}></video>
                      )}
                    </ModalBody>
                  </div>
                </Modal>
              )}
            </div>
            {/* <div className="channel-card">
          <div className="channel-logo">
            <img src={channel.avatar ? channel.avatar : channelAvatar}  className="w-100 h-100" alt="channel logo" />
          </div>
          <div className="channel-name">{channel.name}</div>
          <div className="subscribers">
            Members: <span>{channel.members}</span>
          </div>
          <Link
            onClick={() => this.followChannel(channelName)}
            className="btn cryto-btn mb-3"
          >
            Follow in Resonance
          </Link>
          <Link to={`/channel-preview/${channelName}`} className="btn-preview">
            Preview channel
          </Link>
        </div> */}
          </>
        ) : (
          <div className="channel-card" style={{ margin: 'auto' }}>
            <div className="channel-logo">
              <img src={channelAvatar} className="w-100 h-100" alt="channel logo" />
            </div>
            <div className="channel-name">No channel found</div>
            <div className="subscribers">
              Members: <span>0</span>
            </div>
            <Link to="" className="btn-preview">
              Invalid Link
            </Link>
          </div>
        )}
      </div>
    );
  }
}

PublicChannel.propTypes = {
  messages: PropTypes.array,
};

const mapStateToProps = ({ chat }) => ({
  messages: chat.messages,
});

const mapDispatchToProps = (dispatch) => ({
  onGetChannelMessages: (channelName, callback) =>
    dispatch(getChannelMessages(channelName, callback)),
  onGetFollowChannel: (channelName, callback) =>
    dispatch(getFollowChannel(channelName, callback)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PublicChannel));
