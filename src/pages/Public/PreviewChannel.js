import React, { Component } from "react";
import { Link } from "react-router-dom";
import "react-perfect-scrollbar/dist/css/styles.css";
import { connect } from "react-redux";
import withRouter from "../../components/Common/withRouter";
import channelAvatar from "../../assets/images/channel-avatar.svg";

import { getChannelBySlug, getFollowChannel } from "../../store/actions";

class PreviewChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: null,
    };
  }
  componentDidMount() {
    const { router } = this.props;
    const { channelName } = router.params || {};
    if (channelName) {
      const { onGetChannelBySlug } = this.props;
      onGetChannelBySlug(channelName, (selectedchannel) => {
        this.setState({
          channel: selectedchannel,
        });
      });
    } else {
      console.log(router, "channelName is not defined");
    }
  }
  followChannel = () => {
    const { router } = this.props;
    const { channelName } = router.params || {};
    if (channelName) {
      const { onGetFollowChannel } = this.props;
      onGetFollowChannel(channelName, (selectedchannel, login=null) => {
        if(login){
            this.props.router.navigate("/login")
        }
        this.setState({
          channel: selectedchannel,
        });
      });
    }
  }
  render() {
    const { router } = this.props;
    const { channelName } = router.params || {};
    const { channel } = this.state;
    return (
      <div className="d-flex justify-content-around align-items-center vh-100 main-channel-pub-cls">
        {channel ? (
          <>
            <div className="channel-card">
              <div className="channel-logo">
                <img
                  src={channel.avatar ? channel.avatar : channelAvatar}
                  className="w-100 h-100"
                  alt="channel logo"
                />
              </div>
              <div className="channel-name">{channel.name}</div>
              <div className="subscribers">
                Members: <span>{channel.members}</span>
              </div>
              {/* <div className="subscribers">
                <p>{channel.description}</p>
              </div> */}
              <Link
                onClick={() => this.followChannel(channelName)}
                className="btn cryto-btn mb-3 w-100"
              >
                Follow in Resonance
              </Link>
              <Link to={`/channel/${channelName}`} className="btn-preview">
                Preview channel
              </Link>
            </div>
          </>
        ) : (
          <div className="channel-card">
            <div className="channel-logo">
              <img
                src={channelAvatar}
                className="w-100 h-100"
                alt="channel logo"
              />
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
const mapStateToProps = ({ chat }) => ({
  messages: chat.messages,
});

const mapDispatchToProps = (dispatch) => ({
  onGetChannelBySlug: (channelName, callback) =>
    dispatch(getChannelBySlug(channelName, callback)),
  onGetFollowChannel: (channelName, callback) =>
    dispatch(getFollowChannel(channelName, callback)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(PreviewChannel));
