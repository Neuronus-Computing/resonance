import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
import congratWinIcon from "../../assets/images/chat/congrate_win.svg";
import editwhite from "../../assets/images/editwhite.png";
import { ReactComponent as DownloadIcon } from "../../assets/images/chat/downloadicon.svg";
import { ReactComponent as CongratIcon } from "../../assets/images/chat/congrat.svg";
import { ReactComponent as AttachIcon } from "../../assets/images/attach.svg";
import { ReactComponent as FileAttach } from "../../assets/images/chat/file_attach.svg";
import { ReactComponent as EditIcon } from "../../assets/images/edit.svg";
import { ReactComponent as SearchIcon }  from "../../assets/images/searchicon.svg";
import { ReactComponent as GroupAvatar }  from "../../assets/images/channel-avatar.svg";
import { ReactComponent as ChannelAvatar }  from "../../assets/images/channel-icon.svg";
import { ReactComponent as AddIcon }  from "../../assets/images/add.svg";
import { ReactComponent as TimerIcon }  from "../../assets/images/timer.svg";
import { ReactComponent as MuteIcon }  from "../../assets/images/mute.svg";
import { ReactComponent as PencilIcon }  from "../../assets/images/pencil.svg";
import { ReactComponent as AddNewIcon } from "../../assets/images/add-icon.svg";
import { ReactComponent as UnpinIcon } from "../../assets/images/chat/Unpin.svg";
import searchicon from "../../assets/images/searchicon.svg";
import block from "../../assets/images/block.svg";
import ModelForm from "../../components/Form/Form";
import DynamicModal from "../../components/model/DynamicModal";
import ModelContact from "../../components/Form/Contact";
import { toast } from "react-toastify";
import src from "../../assets/images/create new.png";
import { Button } from "reactstrap";
import { Tooltip } from "react-tooltip";
import FilePreview from "../../components/messages/Preview";
import unpin from "../../assets/images/chat/Unpin.svg";
import { AvForm, AvField, AvInput} from "availity-reactstrap-validation";
import Peer from "simple-peer/simplepeer.min.js";
import socket from "../../util/socket";
import ringtoneFile from "../../assets/images/ringtone.mp3";
import { dateFormatByFlags } from "../../util/dateTime";
import withRouter from "../../components/Common/withRouter";

import {
  Col,
  CardBody,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Row,
  TabContent,
  TabPane,
  Label, 
  Modal,
  ModalHeader,
  ModalBody,
  Nav, NavItem, NavLink 
} from "reactstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import QrScanner from 'react-qr-scanner'; 
import user1 from "../../assets/images/user-img.png";
import {
  addMessage,
  getChats,
  getContacts,
  getGroups,
  getMessages,
  updateBlocked,
  createContact,
  updateMuted,
  updateNote,
  deleteChat,
  updateContact,
  clearChat,
  selectUser,
  createChannel,
  addChannelUser,
  removeChannelUser,
  changeChannelAvatar,
  updateChannel,
  messageRead,
  updateUnreadCount,
  removeMember,
  fetchIdentity,
  payMessage,
  changePreloader,
  updatePaymentRequest,
  updateSuccess
} from "../../store/actions";
import { isVisible } from "@testing-library/user-event/dist/cjs/utils/index.js";

class Chat extends Component {
  constructor(props) {
    super(props);
    const wallets = props.user?.identity?.wallets || [];
    const primaryWallet = props.user?.identity?.wallets?.find(wallet => wallet.isPrimary) || null;
    const myAddress = props.user?.identity?.address || null;
    const settings = this.props.user?.identity?.settings;
    this.state = {
      currentRoomId: 1,
      notification_Menu: false,
      search_Menu: false,
      settings_Menu: false,
      other_Menu: false,
      Chat_Box_Username: "",
      Chat_Box_User_Status: "",
      Chat_Box_User_isActive: false,
      activeChatId: null,
      curMessage: "",
      selectedUser: {},
      breadcrumbItems: [
        { title: "Resonance", link: "/" },
        { title: "Chat", link: "#" },
      ],
      showProfile: false,
      newContactModal: false,
      newContactName: "",
      newContactAddress: "",
      errors: {
        newContactName: "",
        newContactAddress: "",
        note: "",
      },
      isEditingName: false,
      newName: "",
      noteModal: false,
      user: props.user || {},
      messagefile: null,
      fileType: "",
      fileName: "",
      fileExtension: "",
      downloadProgress: {},
      query: "",
      messageSearchQuery: "",
      channelModal: false,
      groupModal:false,
      isaddUserModalOpen: false,
      newChannelName: "",
      avatar: null,
      description: "",
      channelMembers:[],
      imageURL: null,
      showSelectedMemberModal: false, 
      showLinkModal: false,
      appUrl: process.env.REACT_APP_CHANNEL_URL,
      selectedMember: null,
      isMobile: window.innerWidth <= 800,
      qrCodeModalOpen: false,
      activeTab: '1',
      scannedData: null,  
      scanning: true,     
      lastScanned: null,
      badgeVisible:false,
      isMediaModalOpen: false,
      contextMenu: { visible: false, x: 0, y: 0, fileUrl: "", fileType: "" },
      selectedMedia: { url: "", type: "" },
      paymentDescription: '',
      paymentAmount: 0,
      paymentFile: null,
      messageType:'content',
      walletId: wallets[0]?.walletId || null,
      primaryWalletId: primaryWallet?.walletId || null,
      currency:settings.currency || "USD",
      payMessage:null,
      showSuccessModal: false,
      paymentFormConfig: {
        isVisible: false,
        title: "Payment Form",
        content: null, 
      },
      payFormConfig: {
        isVisible: false,
        title: "Pay Form",
        content: null,
      },
      uploadProgress:0,
      fileSize:"",
      isEditingPayment:false,
      messageId:null,
      me: myAddress,
      stream: null,
      remoteStream: null,
      callAccepted: false,
      callEnded: false,
      receivingCall: false,
      calling: false,
      caller: null,
      callerSignal: null,
      showIncomingCallModal: false,
      showOngoingCallModal: false,
      callStartTime: null,
      callDuration: "00:00",
      callTo:null,
      callStatus:'Calling',
      settings:settings || {}
    };
    
    this.messageBox = null;
    this.fileInput = createRef();
    this.docInput = createRef();
    this.channelfileInputRef = createRef();
    this.chatContainerRef = React.createRef(); 
    this.handleCloseModal = this.handleCloseModal.bind(this);   
    this.handleScan = this.handleScan.bind(this);
    this.loginToSocket = this.loginToSocket.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleCreateContact = this.handleCreateContact.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.userAudio = createRef();
    this.connectionRef = null;
    this.callTimer = null;
    this.ringtone = new Audio(ringtoneFile);
    this.ringtone.loop = true; 
  }
  getIdFromUrl = () => {
    const search = this.props.router?.location?.search || "";
    const params = new URLSearchParams(search);
    const id = params.get("id");
    return id ? String(id) : null;
  };
  findChatByUrlId = (id, chats) => {
    if (!id || !Array.isArray(chats)) return null;
  
    return (
      chats.find((c) => {
        const candidates = [
          c?.identityId,
          c?.id,
          c?.contactId,
          c?.contactIdentityId,
          c?.contact?.id,
          c?.contact?.identityId,
        ]
          .filter((x) => x !== undefined && x !== null)
          .map(String);
  
        return candidates.includes(String(id));
      }) || null
    );
  };
  
  openChatFromUrl = () => {
    const id = this.getIdFromUrl();
    if (!id) return false;
  
    const chats = this.props.chats || [];
    const target = this.findChatByUrlId(id, chats);
    if (!target) return false;
  
    const selected = this.state.selectedUser || {};
    const selectedKey = String(
      selected.identityId || selected.contactId || selected.id || ""
    );
    const targetKey = String(target.identityId || target.contactId || target.id || "");
  
    if (selectedKey === targetKey) return true;
  
    this.userChatOpen(target);
    this.setState({ selectedUser: target });
    return true;
  };
  
  componentDidMount() {
    
    socket.connect();
    const { onGetGroups, onGetContacts } = this.props;
    const { query } = this.state;

    onGetGroups();
    onGetContacts(query);

    window.addEventListener("resize", this.handleResize);
    socket.on("connect", () => {
      this.loginToSocket();
    });
    this.attachCallListeners();
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }
  componentWillUnmount() {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("resize", this.handleResize);

    // if (socket) {
    //     socket.off("connect");
    //     socket.disconnect();
    // }
  }
  componentDidUpdate(prevProps, prevState) {
    const { chats, messages, channelSuccess, channel, onGetContacts } = this.props;
    const { selectedUser, user, isMobile } = this.state;
    const getUrlId = (props) => {
      const search = props.router?.location?.search || "";
      const params = new URLSearchParams(search);
      const id = params.get("id");
      return id ? String(id) : null;
    };  
    const findChatById = (id) => {
      if (!id || !Array.isArray(chats)) return null;
      return (
        chats.find((chat) => String(chat.id) === String(id)) ||
        chats.find((chat) => String(chat.identityId) === String(id)) ||
        chats.find((chat) => String(chat.contactIdentityId) === String(id)) ||
        null
      );
    };
    const prevId = getUrlId(prevProps);
    const nextId = getUrlId(this.props);
    if (prevId !== nextId && nextId && chats.length > 0) {
      const targetChat = findChatById(nextId);
      if (targetChat) {
        const selectedKey = String(
          selectedUser?.id || selectedUser?.identityId || selectedUser?.contactIdentityId || ""
        );
        const targetKey = String(
          targetChat?.id || targetChat?.identityId || targetChat?.contactIdentityId || ""
        );
        if (selectedKey !== targetKey) {
          this.userChatOpen(targetChat);
          this.setState({ selectedUser: targetChat });
        }
      }
    }
    if (chats !== prevProps.chats && chats.length > 0 && !isMobile) {
      const id = nextId;  
      let targetChat = null;
      if (id) {
        targetChat = findChatById(id);
      }
      const firstChat = chats[0];
      const chatToOpen = targetChat || firstChat;
      if (Object.keys(selectedUser || {}).length === 0) {
        if (chatToOpen) {
          this.userChatOpen(chatToOpen);
          this.setState({ selectedUser: chatToOpen });
        }
      } else {
        this.handleResize();
      }
    }
    if (messages !== prevProps.messages) {
      messages.forEach(message => {
        if (message.receiver === user.identity.address && message.status !== 'read' && selectedUser.type === 'contact') {
          if (!message.isReadHandled) {
            this.props.messageRead(message);
            message.isReadHandled = true;
          }
        }
      });
    }
    if (chats.length <= 0) {
      if (Object.keys(selectedUser).length !== 0) {
        this.props.selectUser({});
        this.setState({ selectedUser: {} });
      }
    }
    if (this.state.query !== prevState.query) {
      setTimeout(() => {
        this.searchContact();
      }, 500);
    }
    if (channelSuccess !== prevProps.channelSuccess && channel !== prevProps.channel) {
      this.setState({
        newChannelName: "",
        avatar: null,
        description: "",
        channelModal: false,
        groupModal: false,
      });
      setTimeout(()=>{
        onGetContacts(this.state.query);
        }, 500);
        setTimeout(()=>{
          this.userChatOpen(channel);
          this.setState({
            selectedUser:channel,
            isaddUserModalOpen:true
          });
        }, 500);
    }
    if (prevProps.messages.length !== messages.length) {
      this.scrollToBottom();
    }
    if (prevProps.messagesGroupedByDate !== this.props.messagesGroupedByDate) {
      this.scrollToBottom();
    }
    if (this.state.paymentFormConfig.isVisible) {
      if (prevState.messagefile !== this.state.messagefile) {
        if (this.state.paymentFormConfig.content !== null) {
          this.setState((prevState) => ({
            paymentFormConfig: {
              ...prevState.paymentFormConfig,
              content: this.renderPaymentForm(),
            },
          }));
        }
      }
    }
    if (
      this.state.paymentFormConfig.isVisible && 
      this.state.uploadProgress > 0 && 
      this.state.uploadProgress !== prevState.uploadProgress
    ) {
      const newContent = this.renderPaymentForm();
  
      if (this.state.paymentFormConfig.content !== newContent) {
        this.setState((prevState) => ({
          paymentFormConfig: {
            ...prevState.paymentFormConfig,
            content: newContent,
          },
        }));
      }
    }
    if (this.state.payFormConfig.isVisible) {
      if (prevState.walletId !== this.state.walletId) {
        if (this.state.payFormConfig.content !== null) {
          this.setState((prevState) => ({
            payFormConfig: {
              ...prevState.payFormConfig,
              content: this.renderPayForm(),
            },
          }));
        }
      }
    }    
  }
  loginToSocket() {
    const token = localStorage.getItem("token");
    const defaultIdentityAddress = localStorage.getItem("identityAddress");

    if (token && defaultIdentityAddress) {
      socket.emit("login", { token, defaultIdentityAddress });
    } else {
      console.error("Token or identity not found in localStorage.");
    }
  }
  handleVisibilityChange() {    
    if (document.visibilityState === "visible") {
      if (!socket.connected) {
        socket.connect();
        socket.once("connect", () => {
          this.loginToSocket();
          this.attachCallListeners();
        });
      }
    }
  }

  playRingtone = () => {
    if (this.ringtone) {
        this.ringtone.muted = false;
        this.ringtone.play()
            .then(() => {
                console.log("Ringtone is playing...");
            })
            .catch((err) => {
                console.error("Audio play error:", err);
            });
    } else {
        console.error("Ringtone is undefined");
    }
  } ;
  stopRingtone = () => {
    if (this.ringtone) {
        this.ringtone.pause();
        this.ringtone.currentTime = 0;
    } 
  }; 
  startCallTimer = (startTime) => {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
  }
  this.setState({ callDuration: "00:00" });
    this.callTimer = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        this.setState({
            callDuration: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
        });
    }, 1000);
  };
  stopCallTimer = () => {
    if (this.callTimer) {
        clearInterval(this.callTimer);
        this.callTimer = null;
    }
    this.setState({ callDuration: "00:00" });
  };
  callUser = (userToCall) => {
    this.stopCallTimer();
    if (this.connectionRef) {
      return
    }; 
    const { identity } = this.props.user;
    let details = {
        name: identity.nickname ? identity.nickname : identity.address,
        avatar: identity.avatar
    };
    this.setState({ calling: true, showOngoingCallModal: true,callTo : userToCall, callStatus:"Connecting..." });

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            this.setState({ stream });

            // const peer = new Peer({ initiator: true, trickle: false, stream });
            const peer = new Peer({
              initiator: true,
              trickle: false, // Allows ICE candidates to be exchanged asynchronously
              stream,
              config: {
                  iceTransportPolicy: "relay", // Forces usage of TURN, bypassing NAT issues
                  iceServers: [
                      { urls: "stun:stun.l.google.com:19302" }, // Public STUN
                      { urls: "stun:stun1.l.google.com:19302" },

                      // Private TURN Server (for VPN users & strict NAT)
                      {
                          urls: [
                              "turn:188.166.175.67:3478?transport=udp",
                              "turn:188.166.175.67:3478?transport=tcp"
                          ],
                          username: "tronroot",
                          credential: "z62zQpUdw7o6"
                      },
                      {
                          urls: [
                              "turn:10.16.0.7:3478?transport=udp", 
                              "turn:10.16.0.7:3478?transport=tcp"
                          ],
                          username: "tronroot",
                          credential: "z62zQpUdw7o6"
                      }
                  ]
              }
          });
            peer.on("signal", (data) => {
                if (!this.state.callAccepted) {
                    socket.emit("callUser", { 
                        userToCall, 
                        signalData: data, 
                        from: this.state.me, 
                        details 
                    });
                }
            });

            peer.on("stream", (userStream) => {
                let audioElement = document.createElement("audio");
                audioElement.srcObject = userStream;
                audioElement.autoplay = true;
                document.body.appendChild(audioElement);

                this.setState({ remoteStream: userStream });
            });

            this.connectionRef = peer;
        })
        .catch((error) => {
            console.error("Microphone access error:", error);
        });
  };
  leaveCall = () => {
    if (this.connectionRef) {
        this.connectionRef.destroy();
        this.connectionRef = null;
    }
    this.stopCallTimer();
    this.stopRingtone();
    if (this.state.stream) {
        this.state.stream.getTracks().forEach(track => track.stop());
    }
    setTimeout(() => {
        document.querySelectorAll("audio").forEach(audio => audio.remove());
    }, 100);
    if (this.state.caller || this.state.calling) {
      socket.emit("endCall", {from: this.state.me , to: this.state.callTo});
    }
    this.setState({
      callAccepted: false,
      callTo:"",
      callEnded: true,
      receivingCall: false,
      calling: false,
      caller: null,
      callerSignal: null,
      remoteStream: null,
      stream: null,
      callStatus:"Calling",
      showIncomingCallModal: false,
      showOngoingCallModal: false,
  });
    socket.off("callAcceptedByReceiver");
    socket.off("ringing");
    socket.off("callUser");
    // socket.off("answerCall");
    socket.off("userBusy");
    socket.off("updatedContact");
    socket.off("endCall");
    socket.off("callEnded");
    socket.off("callRejected");
    socket.off("startTimeStarted");
    this.attachCallListeners();
  };  
  attachCallListeners = () => {
  socket.on("callAcceptedByReceiver", ({ signal }) => {
    if (!this.state.callAccepted) {
        this.setState({ callAccepted: true, callStatus:"In progress" });
        // this.startCallTimer(startTime);
        if (this.connectionRef) {
          this.connectionRef.signal(signal);
      } else {
          console.error("Connection reference is not initialized");
      }
    }
  });
  socket.on("updatedContact", (contact) => {
    const { updateSuccess} = this.props;
    if(this.state.selectedUser.id === contact.contactToUpdate.id){
      this.setState((prevState) => ({
        isEditing:false,
        selectedUser: {
          ...prevState.selectedUser,
          state: contact.contactToUpdate.status,
        }}));
      }
    updateSuccess(contact.contactToUpdate);
  });
  socket.on("ringing", () => {
    this.setState({callStatus:"Ringing"}); 
  });
  socket.on("startTimeStarted", ({startTime }) => {
    this.setState({ callStartTime:startTime});
    this.startCallTimer(startTime);
  });
  socket.on("callEnded", () => this.leaveCall());
  socket.on("callRejected", () => this.leaveCall());
  socket.on("userBusy", () => {
      this.setState({callStatus:"On another call."});
      // this.leaveCall();
  });

  };
  handleResize = () => {
    this.setState({ isMobile: window.innerWidth <= 800 });
    const {isMobile} = this.state;
    if(!isMobile){
      const leftsidebar = document.querySelector("#leftsidebar");
      const verticleMenu = document.querySelector("#verticleMenu");
      const chatBox = document.querySelector("#chatBox");
      if (leftsidebar && chatBox) {
        leftsidebar.style.display = "block";
        verticleMenu.style.display = "block";
        chatBox.style.display = "block";
      }
    }
  };
  toggleNotification = () => {
    this.setState((prevState) => ({
      notification_Menu: !prevState.notification_Menu,
    }));
  };
  toggleSearch = () => {
    this.setState((prevState) => ({
      search_Menu: !prevState.search_Menu,
    }));
  };

  toggleSettings = () => {
    this.setState((prevState) => ({
      settings_Menu: !prevState.settings_Menu,
    }));
  };

  toggleOther = () => {
    this.setState((prevState) => ({
      other_Menu: !prevState.other_Menu,
    }));
  };

  toggleTab = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  };
  userChatOpen = (chat , callMessages=true , openMessage=false) => {
    const { onGetMessages, selectUser,updateUnreadCount  } = this.props;
    const { user, isMobile } = this.state;

    this.setState({
      activeChatId: chat.id,
      Chat_Box_Username: chat.name,
      messageBox: true,
      currentRoomId: chat.id,
      selectedUser: { ...chat },
      showProfile: false,
      messageSearchQuery: "",
      isEditingName: false,
      curMessage:"",
      showPaymentForm:false,
      imageURL:"",
    });
    selectUser({ ...chat });
    if(chat.unreadCount > 0){
      updateUnreadCount(chat.id, 0);
    }
    if(callMessages){
      if (chat.type === "channel" || chat.type === "group") {
        this.setState({channelMembers: []});
        this.setState({channelMembers: chat.users});
        onGetMessages("", "", chat.id);
      } else {
        this.setState({channelMembers: []});
        onGetMessages(chat.address, user.identity.address, "");
      }
    }
    if(isMobile && openMessage){
      const leftsidebar = document.querySelector("#leftsidebar");
      const verticleMenu = document.querySelector("#verticleMenu");
      const chatBox = document.querySelector("#chatBox");
      setTimeout(()=>{
        if (leftsidebar && chatBox) {
          leftsidebar.style.display = "none";
          verticleMenu.style.display = "none";
          chatBox.style.display = "block";
        }
      },500);
    }
  };
  hideChat =() => {
    const leftsidebar = document.querySelector("#leftsidebar");
    const verticleMenu = document.querySelector("#verticleMenu");
    const chatBox = document.querySelector("#chatBox");
    if (leftsidebar && chatBox) {
      leftsidebar.style.display = "block";
      verticleMenu.style.display = "block";
      chatBox.style.display = "none";
    }
  }
   addMessage = async () => {
    const { onAddMessage } = this.props;
    const {
      curMessage,
      selectedUser,
      user,
      messagefile,
      fileType,
      fileName,
      fileExtension,
      messageType,
      paymentDescription,
      paymentAmount,
      primaryWalletId,
      currency,
      fileSize
    } = this.state;
  
    if (!curMessage.trim() && !messagefile) {
      toast.error("Please type a message or select a file to send.");
      return;
    }
    const message = this.createMessage({
      curMessage,
      selectedUser,
      user,
      fileType,
      fileName,
      fileExtension,
      messageType,
      paymentDescription,
      paymentAmount,
      primaryWalletId,
      currency,
      fileSize
    });
    if (messagefile) {
      try {
        const fileUrl = await this.uploadFileWithProgress(messagefile);
        message.file = fileUrl;
        this.handleSendMessage(message, selectedUser.id);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("File upload failed. Please try again.");
      }
    } else {
      this.handleSendMessage(message, selectedUser.id);
    }
  };
  
  addPaymentMessage = async () => {
    const { onAddMessage } = this.props;
    const {
      curMessage,
      selectedUser,
      user,
      messagefile,
      fileType,
      fileName,
      fileExtension,
      messageType,
      paymentDescription,
      paymentAmount,
      primaryWalletId,
      currency,
      fileSize
    } = this.state;
  
    if (!messagefile) {
      toast.error("Please select a file to send.");
      return;
    }
    const message = this.createMessage({
      curMessage,
      selectedUser,
      user,
      fileType,
      fileName,
      fileExtension,
      messageType,
      paymentDescription,
      paymentAmount,
      primaryWalletId,
      currency,
      fileSize
    });  
    try {
      const fileUrl = await this.uploadFileWithProgress(messagefile);
      message.file = fileUrl; 
      this.handleSendMessage(message, selectedUser.id, true);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("File upload failed. Please try again.");
    }
  };
  updatePaymentMessage = async () => {
    const { updatePaymentRequest } = this.props;
    const {
      messagefile,
      fileType,
      fileName,
      fileExtension,
      paymentDescription,
      paymentAmount,
      currency,
      fileSize,
      messageId,
    } = this.state;
    const message = {
      description:paymentDescription,
      amount:paymentAmount,
      currency,
      fileSize,
      messageId
    }; 
    let fileUrl=""; 
    if(messagefile !== null){
      try {
          fileUrl = await this.uploadFileWithProgress(messagefile);
          message.file = fileUrl; 
          message.fileType=fileType;
          message.fileName=fileName;
          message.fileExtension=fileExtension;
          updatePaymentRequest({message},()=>{
            this.setState((prevState) => ({
              isEditing:false,
              paymentFormConfig: {
                ...prevState.paymentFormConfig,
                isVisible: !prevState.paymentFormConfig.isVisible,
    
              },
              messagefile: null,
              previewFile: null,
              fileType: null,
              fileName: null,
              fileExtension: null,
              messageType: null,
              paymentDescription: "",
              paymentAmount: 0,
              showPaymentForm: false,
              uploadProgress: 0,
            }));
         });
      } catch (error) {
          console.error("Error uploading file:", error);
          toast.error("File upload failed. Please try again.");
      }
    } else {
      updatePaymentRequest({message},()=>{
        this.setState((prevState) => ({
          isEditing:false,
          paymentFormConfig: {
            ...prevState.paymentFormConfig,
            isVisible: !prevState.paymentFormConfig.isVisible,

          },
          messagefile: null,
          previewFile: null,
          fileType: null,
          fileName: null,
          fileExtension: null,
          messageType: null,
          paymentDescription: "",
          paymentAmount: 0,
          showPaymentForm: false,
          uploadProgress: 0,
        }));
     });
    }
  };
  createMessage = ({
    curMessage,
    selectedUser,
    user,
    fileType,
    fileName,
    fileExtension,
    messageType,
    paymentDescription,
    paymentAmount,
    primaryWalletId,
    currency,
    fileSize,
  }) => {
    const sender = user.identity.address;
    const type = selectedUser.type;
  
    if (type === "contact") {
      return {
        id: Math.floor(Math.random() * 100),
        receiver: selectedUser.address,
        sender,
        content: curMessage,
        createdAt: new Date(),
        file: null,
        fileType,
        fileName,
        fileExtension,
        type: messageType,
        paymentDescription,
        paymentAmount,
        walletId: primaryWalletId,
        currency,
        fileSize
      };
    } else {
      return {
        id: Math.floor(Math.random() * 100),
        channelId: selectedUser.id,
        sender,
        receiver: null,
        content: curMessage,
        createdAt: new Date(),
        file: null,
        fileType,
        fileName,
        fileExtension,
        type: messageType,
        fileSize
      };
    }
  };
  uploadFileWithProgress = (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("attachment", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.REACT_APP_API_BASE_URL}/user/upload-file`);
      this.setState({ uploadProgress: 0 });
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          this.setState({ uploadProgress: progress });
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.fileUrl);
        } else {
          this.setState({ uploadProgress: 0 });
          reject(new Error("File upload failed"));
        }
      };
      xhr.onerror = () => {
        this.setState({ uploadProgress: 0 });
        reject(new Error("An error occurred during the file upload"));
      }
      xhr.send(formData);
    });
  };
  handleSendMessage = (message, id, openPaymentForm = false) => {
    const { onAddMessage } = this.props;
    onAddMessage(message, id);
    this.setState({
      curMessage: "",
      messagefile: null,
      previewFile: null,
      fileType: null,
      fileName: null,
      fileExtension: null,
      messageType: null,
      paymentDescription: "",
      paymentAmount: 0,
      showPaymentForm: false,
      uploadProgress: 0,
    });
    if (openPaymentForm) {
      this.openPaymentForm();
    }
    if (this.messageBox) {
      this.messageBox.scrollTop = this.messageBox.scrollHeight + 1000;
    }
  };
  
  payMessage = () => {
    const { onPayMessage } = this.props;
    const {payMessage,walletId,payFormConfig} = this.state;
    let message = {
      ...payMessage,buyerWalletId:walletId
    }
    this.setState({ loading: true });
    this.props.changePreloader(true);
    onPayMessage(message, message.id,(success)=>{
      if(success){
        this.props.changePreloader(false);
        this.setState({ payFormConfig:{...payFormConfig,isVisible:false,showSuccessModal:true , payMessage:message}});
        setTimeout(()=>{
          this.setState({ showSuccessModal:true , payMessage:message});
        },1000);
      }
      else{
        this.props.changePreloader(false);
        this.setState({ payFormConfig:{...payFormConfig,isVisible:true}});
      }
    });
    if (this.messageBox) {
      this.messageBox.scrollTop = this.messageBox.scrollHeight + 1000;
    }
  };
  handleCloseSuccessModal = () => {
    this.setState({ showSuccessModal: false});
  };
  clearChat = () => {
    const { clearChat } = this.props;
    let channelId = null;
    const receiver = this.state.selectedUser.address;
    const sender = this.state.user.identity.address;
    if(this.state.selectedUser.type === 'channel' || this.state.selectedUser.type === 'group'){
      channelId = this.state.selectedUser.id;
    }
    clearChat(receiver, sender, channelId);
  };
  scrollToBottom = () => {
    if (this.chatContainerRef) {
      setTimeout(() => {
        this.chatContainerRef.scrollTop = this.chatContainerRef.scrollHeight;
      }, 100);
    } else {
      console.error("chatContainerRef is not defined or null.");
    }
  };    
  onKeyPress = (e) => {
    const { key, value } = e;
    const { currentRoomId, selectedUser } = this.state;
    if (key === "Enter") {
      this.setState({ curMessage: value });
      this.addMessage(currentRoomId, selectedUser.name);
    }
  };
  toggleProfileView = () => {
    this.setState((prevState) => ({
      showProfile: !prevState.showProfile,
    }));
  };
  handleFormSubmit = (e) => {
    e.preventDefault();
    const { newContactName, newContactAddress } = this.state;
    this.props.createContact({
      name: newContactName,
      address: newContactAddress,
    },() => {
      this.setState({
        newContactName: "",
        newContactAddress: "",
        newContactModal: false 
      });
      const { onGetContacts } = this.props;
      onGetContacts();
    });
    
  };
  handleChannelSubmit = (e) => {
    e.preventDefault();
    const { newChannelName, avatar, description, user } = this.state;
    let fileName =null;
    let fileExtension =null;
    if (avatar) {
      fileName = avatar.name;
      fileExtension = fileName.split(".").pop().toLowerCase();
    }
    this.props.createChannel({
      name: newChannelName,
      avatar: avatar,
      description: description,
      fileExtension: fileExtension,
      createdBy: user.identity.address,
      type:'channel'
    });
  };
  handleGroupSubmit = (e) => {
    e.preventDefault();
    const { newGroupName, avatar, description, user } = this.state;
    let fileName =null;
    let fileExtension =null;
    if (avatar) {
      fileName = avatar.name;
      fileExtension = fileName.split(".").pop().toLowerCase();
    }
    this.props.createChannel({
      name: newGroupName,
      avatar: avatar,
      description: description,
      fileExtension: fileExtension,
      createdBy: user.identity.address,
      type:'group'
    });
  };
  handleNoteSubmit = (e) => {
    e.preventDefault();
    const { id, note } = this.state.selectedUser;
    this.props.updateContact(id, note, "note", "contact",() => {
        this.setState({
          noteModal: false,
          showProfile: true, 
        });
      });
  };
  deleteChat = (type) => {
    const { onGetContacts } = this.props;
    const { id } = this.state.selectedUser;
    this.props.deleteChat(id, type);
    this.setState({ selectedUser: {} });
    setTimeout(() => {
      const { query } = this.state;
      onGetContacts(query);
    }, 200);    
  };
  handleUpdateContact = (field, type = "contact") => {
    const { onGetContacts, updateContact } = this.props;
    const { id, [field]: currentValue } = this.state.selectedUser;
    const newValue = !currentValue;
    updateContact(id, newValue, field, type);
    this.setState((prevState) => ({
      selectedUser: {
        ...prevState.selectedUser,
        [field]: newValue,
      },
    }));
    setTimeout(() => {
      const { query } = this.state;
      onGetContacts(query);
    }, 100);
  };
  handleUpdateContactState = (state, type = "contact") => {
    const { onGetContacts, updateContact } = this.props;
    const {id} = this.state.selectedUser;
    updateContact(id, state, "state", type);
    this.setState((prevState) => ({
      selectedUser: {
        ...prevState.selectedUser,
        state:state,
      },
    }));
    setTimeout(() => {
      const { query } = this.state;
      onGetContacts(query);
    }, 100);
  };
  handleUnpinContact = (id, itemType) => {
    const { onGetContacts, updateContact } = this.props;
    updateContact(id, false, "pinned", itemType ,() => {
      this.setState({
        selectedUser: {
          ...this.state.selectedUser,
          pinned: false,
        },
      });
      onGetContacts();
    });
  };
  searchContact = () => {
    const { onGetContacts } = this.props;
    const { query } = this.state;
    onGetContacts(query);
  };
  handleInputChange = (event) => {
    const { name, value, files } = event.target;
    if (name === "note") {
      this.setState(
        (prevState) => ({
          selectedUser: {
            ...prevState.selectedUser,
            note: value,
          },
        }),
        () => this.validateField(name, value)
      );
    } else if (name === "avatar") {
      this.setState({ [name]: event.target.files[0] }, () =>
        this.validateField(name, files[0])
      );
    }
    else if (name === "walletId") {
      const selectedWallet = this.state.user?.identity?.wallets?.find(
        (wallet) => wallet.walletId === value
      );
      if (selectedWallet) {
        this.setState({
          currency:selectedWallet.coin.toUpperCase(),
          walletId:selectedWallet.walletId
        });
      }
    }
     else {
      this.setState({ [name]: value }, () => this.validateField(name, value));
    }
  };
  handleChannelInputChange = (event) => {
    const { name, value } = event.target;      
      this.setState((prevState) => ({
        selectedUser: {
          ...prevState.selectedUser,
          [name]: value,
        },
      }));
  };
  handleUpdateChannel = () => {
    const { updateChannel } = this.props;
    const { selectedUser } = this.state;
      const { name,link, description, id } = selectedUser;
      updateChannel({ name, description,link, id }, () => {
        const { onGetContacts } = this.props;
        onGetContacts();
        this.setState({
          showProfile: true,
        });
      });
  };
  
  saveNameEdit = () => {
    const { newName } = this.state;
    const { id } = this.state.selectedUser;
      this.props.updateContact(id, newName, "name", "contact", () => {
      this.setState({
        showProfile: true, 
        isEditingName: false,
        selectedUser: {
          ...this.state.selectedUser,
          name: newName,
        },
      });
    });
  };
  
  cancelNameEdit = () => {
    this.setState({
      isEditingName: false,
      newName: this.state.selectedUser.name,
    });
  };
  validateField = (name, value) => {
    let errors = this.state.errors;
    switch (name) {
      case "newContactName":
        if (!value) {
          errors.newContactName = "Name is required.";
        } 
        // else if (value.length < 6) {
        //   errors.newContactName = "Name must be at least 6 characters long.";
        // } 
        else if (value.length > 100) {
          errors.newContactName = "Name must be less than 100 characters long.";
        } else {
          errors.newContactName = "";
        }
        break;
      case "newContactAddress":
        if (!value) {
          errors.newContactAddress = "Address is required.";
        }
        break;
      case "note":
        if (!value) {
          errors.newContactAddress = "Note is required.";
        }
        break;
      default:
        break;
    }
    this.setState({ errors });
  };
  toggleNewContactModal = () => {
    this.setState((prevState) => ({
      newContactModal: !prevState.newContactModal,
    }));
  };
  toggleNewChannelModal = () => {
    this.setState((prevState) => ({
      channelModal: !prevState.channelModal,
    }));
  };
  toggleGroupModal = () => {
    this.setState((prevState) => ({
      groupModal: !prevState.groupModal,
    }));
  };
  toggleNoteModal = () => {
    this.setState((prevState) => ({
      noteModal: !prevState.noteModal,
    }));
  };
  toggleChannelModal = () => {
    this.setState((prevState) => ({
      channelModal: !prevState.channelModal,
    }));
  };
  toggleaddUserModal = () => {
    this.setState((prevState) => ({
      isaddUserModalOpen: !prevState.isaddUserModalOpen,
    }));
  };
  startEditingName = () => {
    this.setState({
      isEditingName: true,
      newName: this.state.selectedUser.name,
    });
  };
  handleFileChanged = (event) => {
      const file = event.target.files[0];
      const name = event.target.name;
      if (!file) {
        return;
      }
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 100MB.");
        return;
      }
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop().toLowerCase();
      const fileSize = this.formatFileSize(file.size);
      let fileType = "document";
      let previewUrl = null;
      const fileCategories = {
        image: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
        video: ["mp4", "mkv", "webm", "avi", "mov"],
        document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
      };
      for (const [type, extensions] of Object.entries(fileCategories)) {
        if (extensions.includes(fileExtension)) {
          fileType = type;
          if (type === "image" || type === "video") {
            previewUrl = URL.createObjectURL(file);
          }
          break;
        }
      }
      if(name === "paymentFile"){
        this.setState({
          messagefile: file,
          fileType: fileType,
          fileName: fileName,
          fileExtension: fileExtension,
          messageType:"payment",
          fileSize:fileSize
        });
      }else{
        this.setState({
          messagefile: file,
          fileType: fileType,
          fileName: fileName,
          fileExtension: fileExtension,
          messageType:fileType,
          fileSize:fileSize,
          previewFile: {
            file,
            fileType,
            fileName,
            fileExtension,
            previewUrl,
          },
        });
      }
  };
  formatFileSize = (bytes) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} Bytes`;
  };
  openFileDialog = () => {
    this.fileInput.current.click();
  };
  openChannelAvatarDialog = () => {
    this.channelfileInputRef.current.click();
  };
  openDocDialog = () => {
    this.docInput.current.click();
  };
  handlechannelFileChange = (event) => {
    const { id } = this.state.selectedUser;
    const file = event.target.files[0];
    setTimeout(() => {
      this.setState({
        showProfile: true,
      });
    },100);
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png"];
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error("Invalid file type. Please select a JPG, JPEG, or PNG file.");
        return;
      }
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target.result;
      };
    
      img.onload = () => {
        if (img.width >= 50 && img.width <= 500 && img.height >= 50 && img.height <= 500) {
          this.setState({
            imageURL: URL.createObjectURL(file),
          });
          this.props.changeChannelAvatar(file, id); 
          
          setTimeout(() => {
            this.setState({
              showProfile: true,
            });
          }, 100);
        } else {
          toast.error("Avatar dimensions must be between 50x50 and 500x500 pixels.");
        }
      };
    
      reader.readAsDataURL(file); 
    }    
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

    // const xhr = new XMLHttpRequest();
    // xhr.open("GET", url, true);
    // xhr.responseType = "blob";
    // xhr.onprogress = (event) => {
    //   const progress = Math.round((event.loaded / event.total) * 100);
    //   this.setState((prevState) => ({
    //     downloadProgress: {
    //       ...prevState.downloadProgress,
    //       [messageId]: progress,
    //     },
    //     contextMenu: { visible: false } 
    //   }));
      
    // };
    // xhr.onload = () => {
    //   if (xhr.status === 200) {
    //     const url = window.URL.createObjectURL(xhr.response);
    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = fileName;
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    //     window.URL.revokeObjectURL(url);
    //     this.setState((prevState) => ({
    //       downloadProgress: {
    //         ...prevState.downloadProgress,
    //         [messageId]: 100,
    //       },
    //     }));
    //   }
    // };
    // xhr.onerror = () => {
    //   toast.error("Download failed. Please try again.");
    // };
    // xhr.send();
  };
  handleCopy = (field , value ) => {
    navigator.clipboard.writeText(value).then(
      () => {
        toast.success(`${field} copied successfully.`);
      },
      (err) => {
        toast.error("Could not copy ${field} : ", err);
      }
    );
  };
  // getMessagesGroupedByDate = (messages, searchQuery) => {
  //   let filteredMessages = messages;
  //   if (searchQuery.trim()) {
  //     filteredMessages = messages.filter(
  //       (message) =>
  //         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         (message.fileName &&
  //           message.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
  //     );
  //   }
  //   const groupedMessages = filteredMessages.reduce((acc, message) => {
  //     const date = moment(message.createdAt).format("ddd, DD MMMM YYYY");
  //     if (!acc[date]) {
  //       acc[date] = [];
  //     }
  //     acc[date].push(message);
  //     return acc;
  //   }, {});
  //   const sortedGroupedMessages = Object.keys(groupedMessages)
  //     .sort((a, b) => {
  //       return moment(a, "ddd, DD MMMM YYYY").toDate() - moment(b, "ddd, DD MMMM YYYY").toDate();
  //     })
  //     .reduce((acc, date) => {
  //       acc[date] = groupedMessages[date];
  //       return acc;
  //     }, {});
  
  //   return sortedGroupedMessages;
  // };
 getMessagesGroupedByDate = (messages = [], searchQuery = "") => {
  // 1) Filter
  let filtered = messages;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = messages.filter((m) => {
      const content = (m.content || "").toLowerCase();
      const fileName = (m.fileName || "").toLowerCase();
      return content.includes(q) || fileName.includes(q);
    });
  }

  // 2) Sort globally (oldest -> newest)
  const sorted = [...filtered].sort((a, b) => {
    const t1 = new Date(a.createdAt).getTime();
    const t2 = new Date(b.createdAt).getTime();
    if (t1 !== t2) return t1 - t2;

    // tie-breaker: id (or created timestamp)
    const id1 = Number(a.id || 0);
    const id2 = Number(b.id || 0);
    return id1 - id2;
  });

  // 3) Group by date (YYYY-MM-DD)
  const grouped = sorted.reduce((acc, msg) => {
    const dateKey = moment(msg.createdAt).format("YYYY-MM-DD");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  // 4) Sort date sections (oldest -> newest)
  const result = Object.keys(grouped)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .reduce((acc, dateKey) => {
      // extra safety: sort inside the group too
      acc[dateKey] = grouped[dateKey].sort((a, b) => {
        const t1 = new Date(a.createdAt).getTime();
        const t2 = new Date(b.createdAt).getTime();
        if (t1 !== t2) return t1 - t2;
        return Number(a.id || 0) - Number(b.id || 0);
      });
      return acc;
    }, {});

  return result;
};

  handleRemoveFile = () => {
    this.setState({
      previewFile: {},
    });
  };
  handleAddUserSubmit = (selectedContacts, values) => {
    const { addChannelUser,onGetContacts } = this.props;
    const { id } = this.state.selectedUser;
    addChannelUser(id, selectedContacts , (updatedUsers) => {
      this.setState(prevState => ({
        selectedUser: {
          ...prevState.selectedUser,
          users: updatedUsers,
        },
        channelMembers:updatedUsers
      }));
      setTimeout(() => {
        const { query } = this.state;
        onGetContacts(query);
      }, 500);
    });
    this.toggleaddUserModal();
  };
  removeMember(id, address){
    const { removeMember } = this.props;
    removeMember(id, address,(updatedUsers) => {
    this.setState(prevState => ({
      selectedUser: {
        ...prevState.selectedUser,
        users: updatedUsers,
      },
      channelMembers:updatedUsers
    }));
  });
  }
  handleLeaveChannel = () => {
    const { removeChannelUser, onGetContacts } = this.props;
    const { id } = this.state.selectedUser;
    const { address } = this.state.user.identity;
    removeChannelUser(id, address);
    setTimeout(() => {
      const { query } = this.state;
      onGetContacts(query);
    }, 500);
  };
  viewMember(member){

    this.setState({
      selectedMember: member,
      showSelectedMemberModal: true,
    });
  };
  handleCloseModal(){
    this.setState({
      showSelectedMemberModal: false,
      selectedMember: null, 
    });
  };
  renderQRCodeModal(){
    const {scannedData,isMobile } = this.state;
    return (
      <Modal isOpen={this.state.qrCodeModalOpen} toggle={this.toggleQRCodeModal} className="modal-dialog-centered">
        <div className="bg-modal">
          <ModalHeader className="modal-header-custom pb-1"> 
            <h2 className="msg-heading">QR Code scanner</h2>
          </ModalHeader>
          <ModalBody className="custom-modal-body">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={this.state.activeTab === '1' ? 'active' : ''}
                  onClick={() => this.toggleTab('1')}
                >
                  Scan QR Code
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
              {scannedData ? (
                    <div>
                      <div className="text-center">
                      <img
                          src={scannedData.avatar ? scannedData.avatar : ""}
                          alt={scannedData.address}
                          className="rounded-circle w-50 h-50 member-ava"
                        />
                      </div>  
                      <h5>Name: {scannedData.nickname ?? "N/A"}</h5>
                      <p>Address: {scannedData.address ?? "N/A" }</p>
                      <Button className="btn w-100 cryto-btn savebtn mt-2" onClick={this.clearScannedData}>
                        Scan Again
                      </Button>
                      <Button className="btn w-100 cryto-btn savebtn mt-2" onClick={this.handleCreateContact}>
                        Add to contact
                      </Button>
                    </div>
                  ) : (
                    <div className="qr-scanner-wrapper">
                      <QrScanner
                        delay={300}
                        onError={this.handleError}
                        onScan={this.handleScan}
                        style={{ width: "100%" }}
                        facingMode={isMobile ? 'rear' : 'front'}
                      />
                      <div className="scanner-overlay">
                        <div className="top-blur" />
                        <div className="middle-row">
                          <div className="left-blur" />
                          <div className="center-clear" />
                          <div className="right-blur" />
                        </div>
                        <div className="bottom-blur" />
                      </div>
                      <p className="text-center">Scan a Resonance QR code.</p>
                    </div>
                  )} 
                  <Button className="btn w-100 reject-btn mt-2" onClick={this.toggleQRCodeModal}>
                    Close
                  </Button>
              </TabPane>
            </TabContent>
          </ModalBody>
        </div>
      </Modal>
    );
  };
  renderPaymentForm (){
    const {paymentDescription, paymentAmount, fileName, messagefile} = this.state;
    return (
      <AvForm className="form-horizontal"   onValidSubmit={this.state.isEditingPayment ? this.updatePaymentMessage : this.addPaymentMessage}
      >
      <Row>
        <Col lg={12}>
          <label className="form-label-cls">Description</label>
           <AvField
            name="paymentDescription"
            value={paymentDescription}
            onChange={this.handleInputChange}
            validate={{
              required: { value: true, errorMessage: "Description is required" },
            }}
            type="textarea"
            placeholder="Description Here..."
            className="form-control"
          />
        </Col>
        <Col lg={12}>
          <label className="form-label-cls">Amount</label>
           <AvField
            type="number"
            name="paymentAmount"
            value={paymentAmount}
            onChange={this.handleInputChange}
            validate={{
              required: { value: true, errorMessage: "Amount is required" },
              min: { value: 1, errorMessage: `Amount must be at least 1 ${this.state.currency}.`},
            }}
            placeholder="0.00"
            className="form-control"
          />
        </Col>
        <Col lg={12}>
          <div className="detail-form pl-0">
            <label className="form-label-cls">File</label>
            <div className="custom-file">
              <AvInput className={`file-name mr-auto form-control form-text-cls mt-0`}
                  value={fileName || ""}
                  placeholder="Please select file."
                  name="file-field"
                  validate={{
                    required: { value: true, errorMessage: "File is required" },
                  }}
                  readOnly
                  disabled
              />
              <label
                  className="custom-file-label"
                  htmlFor="paymentFile"
                >
                  Upload File
                  <input
                    type="file"
                    className="custom-file-input"
                    id="paymentFile"
                    name="paymentFile"
                    onChange={this.handleFileChanged}
                  />
                </label>
            </div>
          </div>
          
        </Col>
      </Row>
      {this.state.uploadProgress > 0 && (
        <div className="file-upload-progress">
          <div className="progress-bar-container d-flex align-items-center">
            {this.state.previewFile?.previewUrl ? (
              <>
                  {this.state.previewFile.fileType === 'image' && (
                    <img
                      src={this.state.previewFile.previewUrl}
                      alt={this.state.previewFile.fileName}
                      style={{ width: '60px', height: 'auto' }}
                    />
                  )}
                  {this.state.previewFile.fileType === 'video' && (
                    <video controls width="150">
                      <source src={this.state.previewFile.previewUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {this.state.previewFile.fileType === 'document' && (
                    <div>
                      <i className="fa fa-file" /> {this.state.previewFile.fileName}
                    </div>
                  )}
                </>
              ) : (
                <i className="fa fa-file" style={{fontSize: "17px"}}/>
              )}
              <div className="file-details">
                <span className="file-name px-2">{this.state.fileName}</span>
                <span className="file-size">{this.state.fileSize}</span>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${this.state.uploadProgress}%` }}
              >
                {this.state.uploadProgress}%
              </div>
            </div>
          </div>
        )}
        <div className="text-center">
            <Button
              type="submit"
              className="btn cryto-btn me-2"
              disabled={this.state.uploadProgress > 0 && this.state.uploadProgress < 100}
            >
              Send
            </Button>
            <Button
              type="button"
              className="reject-btn" onClick={this.openPaymentForm}
              disabled={this.state.uploadProgress > 0 && this.state.uploadProgress < 100}
            >
              Close
            </Button>
        </div>  
                        
    </AvForm>
    );
  }
  renderPayForm(){
    const {walletId} =this.state;
    return(
      <AvForm className="form-horizontal" onValidSubmit={this.payMessage} >
        <Row>
          <Col lg={12}>
          <div className="detail-form">
            <label className="form-label-cls">Wallet</label>
            <select
              name="walletId"
              value={walletId}
              onChange={this.handleInputChange}
              className="form-control form-text-cls"
              required
            >
              {this.state.user.identity.wallets.length > 0 ? (
                this.state.user.identity.wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.walletId}>
                    {wallet.label} {wallet.balance} {wallet.coin.toUpperCase()}
                  </option>
                ))
              ) : (
                <option value="">No wallet found</option>
              )}
            </select>
            </div>
          </Col>
        </Row>
        
        <div className="text-center">
            <Button
              type="submit"
              className="btn cryto-btn me-2"
            >
              Pay
            </Button>
            <Button
              type="button"
              className="reject-btn" onClick={this.openPayForm}
            >
              Close
            </Button>
          </div>
      </AvForm>
    )
  }
  openPaymentForm = () => {
    if(this.state.primaryWalletId){
      this.setState((prevState) => ({
        paymentAmount:0,
        paymentDescription:"",
        fileName:'',
        isEditing:false,
        paymentFormConfig: {
          ...prevState.paymentFormConfig,
          isVisible: !prevState.paymentFormConfig.isVisible,
          title: "Create Payment",
          content: prevState.payFormConfig.isVisible
              ? null
              : this.renderPaymentForm(),
        },
      }));
    }
    else{
      toast.error("You donot have primary wallet to receive payment. Please create primary wallet.");
    }
  };
  openPayForm = (message=null) => {
    if(this.props.user?.identity?.wallets.length > 0)
      {
        this.setState((prevState) => ({
          payFormConfig: {
            ...prevState.payFormConfig,
            isVisible: !prevState.payFormConfig.isVisible, 
            title: "Send Payment",
            content: prevState.payFormConfig.isVisible
              ? null
              : this.renderPayForm(), 
          },
          payMessage:message
        }));
      }
      else{
        toast.error("You donot have any wallet to pay. Please create wallet.");
      }
  };
  editPayment(message){
    this.setState(
      {
          paymentDescription: message.payment.description,
          paymentAmount: message.payment.amount,
          fileName: message.fileName,
          isEditingPayment:true,
          messageId:message.id,
      },
      () => {
            this.setState((prevState) => ({
                paymentFormConfig: {
                    ...prevState.paymentFormConfig,
                    isVisible: !prevState.paymentFormConfig.isVisible,
                    title: "Edit Payment",
                    content: prevState.paymentFormConfig.isVisible
                        ? null
                        : this.renderPaymentForm(),
                },
            }));
        }
    );
  }
  toggleScannerModal = () => {
    this.setState({ scannerModalOpen: !this.state.scannerModalOpen });
  };
  handleScan = (data) => {
    if (data && this.state.scanning) {
      if (data.text.startsWith("R-")) {
        if (!this.state.lastScanned || this.state.lastScanned !== data.text) {
          this.setState({ lastScanned: data.text });
            this.props.fetchIdentity(data.text,null, (identity) => {
            this.setState({
              scannedData: identity,
              scanning: false,   
              lastScanned: null,
            });
          });
        }
      } else {
        if (!this.state.lastScanned || this.state.lastScanned !== data.text) {
          this.setState({
            lastScanned: data.text, 
            scanning: false,
          });
  
          setTimeout(() => {
            this.setState({
              lastScanned: null,
              scanning: true, 
            });
          }, 500);
        }
      }
    }
  };  
  handleCreateContact(){
    const { nickname, address } = this.state.scannedData;
    this.props.createContact({
      name: nickname ? nickname : address,
      address: address,
    },() => {
      const { onGetContacts } = this.props;
      onGetContacts();
    });
  }
  handleSearchChange=(nickname) => {
    this.setState({
      newContactName:"",
      newContactAddress:""
     });
    this.props.fetchIdentity(null,nickname,(identity) => {
      this.setState({
       newContactName:identity.nickname ?? identity.address,
       newContactAddress:identity.address
      });
    });
  }
  clearScannedData = () => {
    this.setState({
      scannedData: null,  
      scanning: true, 
      lastScanned: null,
    });
  };
  handleError = (err) => {
    console.log('Error scanning QR code. Please try again.');
  };
  toggleQRCodeModal = () => {
    this.toggleNewContactModal();
    this.clearScannedData();
    this.setState({ qrCodeModalOpen: !this.state.qrCodeModalOpen });
  };
  getSenderColor(sender) {
    const colors = Array.from({ length: 100 }, (_, i) =>
      `hsl(${(i * 137.5) % 360}, 50%, 30%)` // 30% lightness for dark colors
    );
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
      hash = sender.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  }
  
  openMediaModal = (url, type) => {
    this.setState({ isMediaModalOpen: true, selectedMedia: { url, type } });
  };

  closeMediaModal = () => {
    this.setState({ isMediaModalOpen: false, selectedMedia: { url: "", type: "" } });
  };
  showContextMenu = (event,id,fileUrl,fileType,fileName) => {
    event.preventDefault();
    if (["image", "video", "document"].includes(fileType)) {
      this.setState({
        contextMenu: { visible: true, x: event.clientX, y: event.clientY,id,fileUrl, fileType,fileName },
      });
    }
  };
  render() {
    const { chats } = this.props;
    let messages = this.props.messages || [];
    const {
      showProfile,
      selectedUser,
      newContactModal,
      newContactName,
      newContactAddress,
      errors,
      noteModal,
      isEditingName,
      newName,
      query,
      messageSearchQuery,
      previewFile,
      newChannelName,
      newGroupName,
      channelModal,
      groupModal,
      avatar,
      description,
      user,
      isaddUserModalOpen,
      channelMembers,
      activeChatId,
      imageURL,
      showSelectedMemberModal,
      selectedMember,
      isMobile,
      appUrl,
      contextMenu,
      isMediaModalOpen, 
      selectedMedia,
      currency,
      showSuccessModal,
      payMessage,
      paymentFormConfig,
      payFormConfig,
      receivingCall, caller, callAccepted, callEnded, settings
    } = this.state;
    const messagesGroupedByDate = this.getMessagesGroupedByDate(
      messages,
      messageSearchQuery
    );
    const fields = [
      {
        name: "newContactName",
        label: "Name",
        value: newContactName,
        type: "text",
        placeholder: "Contact name",
        required: true,
        maxLength: 100,
      },
      {
        name: "newContactAddress",
        label: "Address",
        value: newContactAddress,
        type: "text",
        placeholder: "Identity address",
        required: true,
      },
    ];
    const channelFields = [
      {
        name: "avatar",
        label: "Channel Avatar",
        value: avatar,
        type: "file",
        placeholder: "Upload an avatar",
        required: false,
      },
      {
        name: "newChannelName",
        label: "Channel Name",
        value: newChannelName,
        type: "text",
        placeholder: "Channel name",
        required: true,
        maxLength: 100,
      },
      {
        name: "description",
        label: "Channel Description",
        value: description,
        type: "textarea",
        placeholder: "Channel description",
        required: true,
        minLength:10
      },
    ];
    const groupFields = [
      {
        name: "avatar",
        label: "Group Avatar",
        value: avatar,
        type: "file",
        placeholder: "Upload an avatar",
        required: false,
      },
      {
        name: "newGroupName",
        label: "Group Name",
        value: newGroupName,
        type: "text",
        placeholder: "Group name",
        required: true,
        maxLength: 100,
      },
      {
        name: "description",
        label: "Group Description",
        value: description,
        type: "textarea",
        placeholder: "Group description",
        required: true,
        minLength:10
      },
    ];
    const notefields = [
      {
        name: "note",
        label: "Note",
        value: selectedUser.note,
        type: "textarea",
        placeholder: "Note",
        required: true,
      },
    ];
    const avatarURL = imageURL ? imageURL : (selectedUser.avatar ? selectedUser.avatar :  "");
    let divStyle1 = {
      height: '130px',
      width: '130px',
      backgroundImage: `url(${avatarURL})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      cursor: 'pointer',
    };
    return (
      <React.Fragment>
        <div className="page-content">
          <Container className="right-msg p-0">
            {/* Render Breadcrumb */}
            {/* <Breadcrumbs
              title="Chat"
              breadcrumbItems={this.state.breadcrumbItems}
            /> */}
            <div className="d-lg-flex mb-0 chat-side">
              <div className="chat-leftsidebar" id="leftsidebar">
                <div className="head-cht border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="flex-1 ">
                      <h3 className="msg-heading">Messages</h3>
                    </div>
                    <div className="edit-icon">
                      <Dropdown
                        isOpen={this.state.other4}
                        toggle={() =>
                          this.setState({ other4: !this.state.other4 })
                        }
                        data-tooltip-id="chat-tooltip"
                        data-tooltip-content="Create new contact."
                      >
                        <DropdownToggle
                          className="btn nav-btn edit-drop"
                          tag="i"
                        >
                         <EditIcon style={{ color: 'var(--skyblueText) !important' }} className="edit-default" alt="Edit" />  
                         <EditIcon style={{ color: '#fff !important' }} className="edit-mobile" alt="Edit" />         
                          {/* <img src={edit} className="edit-default" alt="Edit" /> */}
                          {/* <img
                            src={editwhite}
                            className="edit-mobile"
                            alt="Edit"
                          /> */}
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end-cls drop-menu">
                          <DropdownItem
                            href="#"
                            className="drop-icons"
                            onClick={this.toggleNewContactModal}
                          >
                            <i className="ri-chat-new-line"></i>
                            New Chat
                          </DropdownItem>
                          <DropdownItem
                            href="#"
                            className="drop-icons"
                            onClick={this.toggleNewChannelModal}
                          >
                            <i className="fas fa-broadcast-tower"></i>
                            New Channel
                          </DropdownItem>
                          <DropdownItem
                            href="#"
                            className="drop-icons"
                            onClick={this.toggleGroupModal}
                          >
                          <i className="fas fa-users"></i>
                            Add New Group
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <Tooltip id="chat-tooltip" />
                    </div>
                  </div>
                </div>
                <div className="main-chat-point">
                  <CardBody className="py-2">
                    <div className="search-box chat-search-box">
                      <div className="position-relative">
                        <Input
                          placeholder="Search chat..."
                          name="query"
                          type="text"
                          value={query}
                          onChange={this.handleInputChange}
                        />
                        <SearchIcon
                          className="ri-search-line search-icon"
                          style={{color: 'var(--skyblue) !important',
                            top: '50%',
                            width: '17px',
                            transform: 'translateY(-50%)',
                           }}
                          onClick={this.searchContact}
                        />
                        {/* <i
                          className="ri-search-line search-icon"
                          onClick={this.searchContact}
                        ></i> */}
                      </div>
                    </div>
                  </CardBody>
                  <TabContent activeTab={this.state.activeTab} className="py-3">
                  <TabPane tabId="1">
                      <div>
                        <ul className="list-unstyled chat-list side-height-cls chat-mobile-list">
                          <PerfectScrollbar className="main-point-cls ">
                            {chats.length === 0 ? (
                              <li className="no-contacts text-center">
                                <p>No contacts found</p>
                              </li>
                            ) : (
                              chats
                                .sort((a, b) => (a.state === "request" ? -1 : b.state === "request" ? 1 : 0))
                                .map((chat, key) => (
                                  <li
                                    key={key}
                                    className={`chat-side-bar ${chat.id === activeChatId ? "active" : ""}`}
                                  >
                                    <Link
                                      to="#"
                                      onClick={() => {
                                        this.userChatOpen(chat, true, true);
                                      }}
                                    >
                                      <div className="d-flex align-items-center w-100">
                                        <div
                                          className={`header-contact ${
                                            chat.status === "available"
                                              ? "user-img online align-self-center me-3"
                                              : "user-img away align-self-center me-3"
                                          }`}
                                        >
                                           {chat.avatar ? (
                                            <img
                                              src={
                                                
                                                  chat.avatar
                                                  
                                              }
                                              className="rounded-circle avatar-sm"
                                              alt="avatar"
                                            />)
                                            : 
                                            <>
                                            {chat.type === "contact" ?  (                               
                                              <img src={user1} alt="avatar" 
                                                className="rounded-circle avatar-sm pointer"
                                                onClick={this.toggleProfileView}
                                              /> ):
                                            (chat.type === "channel" ? (
                                                <ChannelAvatar  style={{ color: 'var(--skyblue) !important' }}  className="rounded-circle avatar-sm"/>
                                              ) : (
                                                <GroupAvatar  style={{ color: 'var(--skyblue) !important' }}  className="rounded-circle avatar-sm"/>
                                            ))}
                                            </>                                            
                                            }
                                          {(chat.type === "contact" && chat.name !== "BotAi")  && (
                                            <>
                                              {chat.status === "available" && (
                                                <i className="mdi mdi-circle text-success align-middle me-1 main-clas-dot"></i>                                          
                                              )}
          
                                              {chat.status === "busy" && (
                                                <i className="mdi mdi-circle text-danger align-middle me-1 main-clas-dot"></i>
                                              )}
          
                                              {chat.status === "only_important" && (
                                                <i className="mdi mdi-circle text-warning align-middle me-1 main-clas-dot status-pulse"></i>
                                              )}
          
                                              {chat.status === "away" && (
                                                <i className="mdi mdi-circle text-warning align-middle main-clas-dot"></i>
                                              )}
          
                                              {chat.status === "invisible" && (
                                                <i className="mdi mdi-circle-outline text-secondary align-middle me-1 main-clas-dot opacity-50"></i>
                                              )}
          
                                              {chat.status === "offline" && (
                                                <i className="mdi mdi-circle text-muted align-middle me-1 main-clas-dot opacity-25"></i>
                                              )}
                                              {chat.status === "ghost" && (
                                                <></>
                                              )}
                                            </>                                               
                                          )}
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center flex-grow-1 overflow-hidden">
                                          <div className="d-flex flex-column">
                                            <h5 className="text-truncate chat-name m-0">
                                              {chat.name.length > 16
                                                ? `${chat.name.substring(0, 13)}...`
                                                : chat.name}
                                            </h5>
                                            <p className="text-truncate chat d-flex m-0">
                                              {["pending", "request", "blocked"].includes(chat?.state) ? (
                                                <span>
                                                  <i className="fa fa-user-plus" aria-hidden="true"></i>{" "}
                                                  {chat.state === "pending"
                                                    ? " Pending Approval"
                                                    : chat.state === "request"
                                                    ? " New Invitation"
                                                    : chat.state === "blocked"
                                                    ? " Request Rejected"
                                                    : chat.state.charAt(0).toUpperCase() +
                                                      chat.state.slice(1)}
                                                </span>
                                              ) : chat?.message ? (
                                                <>
                                                  {chat.message.content ? (
                                                    chat.message.content.length > 16
                                                      ? `${chat.message.content.substring(0, 16)}...`
                                                      : chat.message.content
                                                  ) : (
                                                    <span>
                                                      <i
                                                        className={`fa ${
                                                          {
                                                            image: "fa-file-image",
                                                            video: "fa-file-video",
                                                            document: "fa-file-alt",
                                                            payment: "fa-money-bill-wave",
                                                          }[chat.message.type] || "fa-file"
                                                        } px-1`}
                                                      />
                                                      {chat.message.type.charAt(0).toUpperCase() +
                                                        chat.message.type.slice(1)}
                                                    </span>
                                                  )}
                                                </>
                                              ) : null}
                                            </p>
                                          </div>
                                          <div className="d-flex flex-column align-items-end">
                                            <small className="chat-time  m-0">
                                              {chat.lastMessageTimestamp
                                                ? 
                                                dateFormatByFlags(chat.lastMessageTimestamp,settings, false, false, true,false,false,settings?.timeFormat)
                                                : ""}
                                            </small>
                                            <div className="d-flex">
                                              {chat.unreadCount > 0 && (
                                                <span className="pull-right mx-1 count-cls">
                                                  {chat.unreadCount}
                                                </span>
                                              )}
                                              {chat.pinned && (
                                                <UnpinIcon style={{ color: 'var(--skyblueText) !important',  width: "16px", height: "16px"  }}
                                                  onClick={() =>
                                                    this.handleUnpinContact(chat.id, chat.type)
                                                  }
                                                  data-tooltip-id="unpin-tooltip"
                                                  data-tooltip-content="Unpin chat."
                                                />
                                              )}
                                               {chat.muted && (
                                                <MuteIcon style={{ color: 'var(--skyblueText) !important',  width: "16px", height: "16px"  }} />
                                              )}
                                              <Tooltip id="unpin-tooltip" />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                ))
                            )}
                          </PerfectScrollbar>
                        </ul>
                      </div>
                    </TabPane>
                  </TabContent>
                </div>
              </div>
              <div className="w-100 user-chat mt-4 mt-sm-0 user-chat-over" id="chatBox">
                {Object.keys(selectedUser).length > 0 && (
                  <div className="user-chat-border">
                    {showProfile ? (
                      <div className="contact-info">
                        <i
                          className="ri-arrow-left-line"
                          onClick={this.toggleProfileView}
                        ></i>{" "}
                        <span>
                          <h4>{selectedUser.type === "contact" ? "Contact Info" : `${selectedUser.type ? selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1): 'Channel'} Info`}</h4>
                        </span>
                      </div>
                    ) : (
                      <Row>
                        <Col md={5} xs={6}>
                            <div className="header-contact">
                            {(isMobile && !showProfile) && (
                              <i
                              className="ri-arrow-left-line back-arrow"
                                onClick={this.hideChat}
                              ></i>
                            )}
                              <div className="align-self-center me-3">
                                {selectedUser.avatar ? (
                                  <img
                                    src={selectedUser.avatar}
                                    className="avatar-sm rounded-circle pointer"
                                    alt="avatar"
                                    onClick={
                                      selectedUser.name === "BotAi"
                                        ? undefined
                                        : this.toggleProfileView
                                    }                      
                               />
                                ) : (
                                 (
                                  <>
                                  {selectedUser.type === "contact" ?                                 
                                    <img src={user1} alt="avatar" 
                                      className="rounded-circle avatar-sm pointer"
                                      onClick={this.toggleProfileView}
                                    />
                                  :
                                   (selectedUser.type === "channel" ?
                                     (
                                        <ChannelAvatar 
                                         style={{ color: 'var(--skyblue) !important' }}  
                                         className="rounded-circle avatar-sm pointer"
                                         onClick={this.toggleProfileView}
                                        />
                                      ) 
                                      : (
                                        <GroupAvatar  
                                        style={{ color: 'var(--skyblue) !important' }}  
                                        className="rounded-circle avatar-sm pointer"
                                        onClick={this.toggleProfileView}
                                        />
                                      ))
                                  }
                                  </>
                                  )
                                  
                                )}
                                {(selectedUser.type === "contact" && selectedUser.name !== "BotAi")  && (
                                  <>
                                    {selectedUser.status === "available" && (
                                      <i className="mdi mdi-circle text-success align-middle me-1 main-clas-dot"></i>                                          
                                    )}

                                    {selectedUser.status === "busy" && (
                                      <i className="mdi mdi-circle text-danger align-middle me-1 main-clas-dot"></i>
                                    )}

                                    {selectedUser.status === "only_important" && (
                                      <i className="mdi mdi-circle text-warning align-middle me-1 main-clas-dot status-pulse"></i>
                                    )}

                                    {selectedUser.status === "away" && (
                                      <i className="mdi mdi-circle text-warning align-middle me-1 main-clas-dot"></i>
                                    )}

                                    {selectedUser.status === "invisible" && (
                                      <i className="mdi mdi-circle-outline text-secondary align-middle me-1 main-clas-dot opacity-50"></i>
                                    )}

                                    {selectedUser.status === "offline" && (
                                      <i className="mdi mdi-circle text-muted align-middle me-1 main-clas-dot opacity-25"></i>
                                    )}
                                    {selectedUser.status === "ghost" && (
                                      <></>
                                    )}
                                  </>
                                )}
                              </div>
                              <h5 className="main-chat text-left pointer" 
                                  onClick={
                                    selectedUser.name === "BotAi"
                                      ? undefined
                                      : this.toggleProfileView
                                  }   
                                >
                                {this.state.Chat_Box_Username.length > 16 ? `${this.state.Chat_Box_Username.substring(0, 13)}...` : this.state.Chat_Box_Username}
                                <br></br>
                                {selectedUser.lastSeen &&(
                                <small className="text-muted" style={{ fontSize:"8px" }}>Last seen : {dateFormatByFlags(selectedUser.lastSeen,this.props.user?.identity?.settings, true, true, true,true,false,settings?.timeFormat)}
                                </small>
                                )}
                              </h5>
                              {selectedUser.type === "contact" && (
                                <>
                                  {/* <img
                                    src={pgp}
                                    className="pgp-img"
                                    alt="PGP Icon"
                                  />
                                  <p className="pgp">PGP</p> */}
                              
                                </>
                              )}                             
                            </div>
                        </Col>
                        {(selectedUser.name !== "BotAi") && (
                        <Col md={7} xs={6}>
                          <ul className="list-inline user-chat-nav text-end mb-0 d-flex justify-content-end">
                            <li className="list-inline-item d-inline-block d-sm-none ">
                              <Dropdown
                                isOpen={this.state.settings}
                                toggle={() =>
                                  this.setState({
                                    settings: !this.state.settings,
                                  })
                                }
                              >
                                <DropdownToggle
                                  className="btn nav-btn dropdown-toggle"
                                  type="button"
                                >
                                  <i className="mdi mdi-magnify"></i>
                                </DropdownToggle>
                                <DropdownMenu end className="dropdown-menu-md">
                                    <div className="search-box">
                                      <div className="position-relative">
                                      <input type="text" 
                                          className="search-input"
                                          placeholder="Search in messages..."
                                          name="messageSearchQuery"
                                          value={messageSearchQuery}
                                          onChange={this.handleInputChange}
                                          style={{
                                            backgroundImage: `url(${searchicon})`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                </DropdownMenu>
                              </Dropdown>
                            </li>
                            {selectedUser.type === "contact" && selectedUser.state === "accepted"  &&(
                              <li className="">
                                <div className="position-relative">
                                  <span className="p-1 rounded-circle bg-success text-white">
                                    <i className="mdi mdi-phone" onClick={() => this.callUser(selectedUser.address)}></i>
                                  </span>
                                </div>
                              </li>
                            )} 
                            <li className="list-inline-item">
                              <div className="position-relative">
                              <SearchIcon
                                style={{
                                  color: 'var(--skyblue)',
                                  position: 'absolute',
                                  left: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: '25px',
                                  height: '25px',
                                  pointerEvents: 'none',
                                  paddingLeft: '8px',
                                }}
                              />
                              <input
                                type="text"
                                className="search-input"
                                placeholder="Search in messages..."
                                name="messageSearchQuery"
                                value={messageSearchQuery}
                                onChange={this.handleInputChange}
                                style={{ paddingLeft: '35px' }}
                              />
                              </div>
                            </li>
                            <li className="list-inline-item">
                              <Dropdown
                                isOpen={this.state.other2}
                                toggle={() =>
                                  this.setState({ other2: !this.state.other2 })
                                }
                              >
                                <DropdownToggle
                                  className="btn nav-btn "
                                  tag="i"
                                >
                                  <i className="mdi mdi-dots-horizontal"></i>
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu-end drop-menu">
                                  {selectedUser.type === "channel" || selectedUser.type === "group" ? (
                                    <>
                                      <DropdownItem
                                        onClick={() => this.handleUpdateContact("pinned", "channel")}
                                      >
                                        {selectedUser.pinned ? "Unpin": "Pin"} conversation
                                      </DropdownItem>
                                      <DropdownItem onClick={this.clearChat}>
                                        Clear chat
                                      </DropdownItem>
                                      {user.identity.address ===
                                        selectedUser.createdBy ? (
                                        <DropdownItem
                                          className="inner-clr"
                                          onClick={() =>
                                            this.deleteChat("channel")
                                          }
                                        >
                                          {" "}
                                          Delete Channel
                                        </DropdownItem>
                                      ):
                                      (
                                        <DropdownItem
                                          onClick={() =>
                                            this.handleLeaveChannel()
                                          }
                                        >
                                          {" "}
                                          Leave Channel
                                        </DropdownItem>)
                                      }
                                      <DropdownItem
                                        href="#"
                                        onClick={this.toggleProfileView}
                                      >
                                        Show {selectedUser.type ?? "channel"} details
                                      </DropdownItem>
                                    </>
                                  ) : (
                                    <>
                                      <DropdownItem
                                        onClick={() =>
                                          this.handleUpdateContact(
                                            "pinned",
                                            "contact"
                                          )
                                        }
                                      >
                                        {" "}
                                        {this.state.selectedUser.pinned
                                          ? "Unpin"
                                          : "Pin "}{" "}
                                        conversation
                                      </DropdownItem>
                                      <DropdownItem onClick={() =>
                                        this.handleUpdateContact("muted")}>
                                      {selectedUser.muted ? "Unmute" : "Mute"} notification
                                      </DropdownItem>
                                      <DropdownItem 
                                        onClick={() =>
                                          this.handleCopy("Resonance ID",selectedUser.address)
                                        }
                                      >
                                        Copy resonance ID{" "}
                                      </DropdownItem>
                                      <DropdownItem onClick={this.clearChat}>
                                        Clear chat
                                      </DropdownItem>
                                      <DropdownItem
                                        href="#"
                                        className="inner-clr"
                                        onClick={() =>
                                          this.deleteChat("contact")
                                        }
                                      >
                                        Delete chat
                                      </DropdownItem>
                                      <DropdownItem
                                        href="#"
                                        onClick={this.toggleProfileView}
                                      >
                                        Show details
                                      </DropdownItem>
                                    </>
                                  )}
                                </DropdownMenu>
                              </Dropdown>
                            </li>
                          </ul>
                        </Col>
                        )}
                      </Row>
                    )}
                  </div>
                )}
                <div className="">
                  {showProfile ? (
                    <>
                      {selectedUser.type === "contact" ?
                        (
                          <div className="chat-conversation p-3 chat-conversation-height">
                            <div className="row justify-content-center main-show-details-cls text-center">
                              <div className="width-660">
                                <div className="conversation-list user-profile profile-options">
                                  <div className="dp-profile">
                                    <img
                                      src={
                                        selectedUser.avatar
                                          ? selectedUser.avatar
                                          : user1
                                      }
                                      alt="avatar"
                                      className="rounded-circle avatar-lgg"
                                    />
                                    {selectedUser.type === "contact" && (
                                    <>
                                      {selectedUser.status === "active"  ? (
                                        <>
                                          <i className="mdi mdi-circle text-success align-middle me-1"></i>
                                        </>
                                      ):(
                                        <>
                                          <i className="mdi mdi-circle text-secondary align-middle me-1"></i>
                                        </>
                                      )}
                                    </>
                                  )}
                                  </div>
                                </div>
                                <div className="ctext-wrap">
                                  <div className="conversation-name edit-name">
                                    {isEditingName ? (
                                      <div className="edit-btns">
                                        <input
                                          name="newName"
                                          type="text"
                                          value={newName}
                                          onChange={this.handleInputChange}
                                          className="form-control edit-control"
                                          maxLength="100"
                                        />
                                        <Button
                                          onClick={this.cancelNameEdit}
                                          className="reject-btn cncl-btn"
                                        >
                                          <i className="fas fa-times"></i>
                                        </Button>
                                        <Button
                                          onClick={this.saveNameEdit}
                                          className="btn cryto-btn savebtns"
                                        >
                                          <i className="fas fa-check"></i>
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="d-flex">
                                        <h4 className="mb-1">
                                          {selectedUser.name.length > 16 ? `${selectedUser.name.substring(0, 13)}...` : selectedUser.name}
                                        </h4>
                                        <PencilIcon style={{ color: 'var(--skyblueText) !important' , width:20, height:20}}  
                                         onClick={this.startEditingName}
                                          alt="pencil"
                                          data-tooltip-id="edit-tooltip"
                                          data-tooltip-content="Edit contact name."/>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Tooltip id="edit-tooltip" />
                                <div className="text-center">
                                  <p className="text-muted mb-0">
                                    Status: {selectedUser.status}
                                  </p>
                                  <div className="mt-3 profile-btns">
                                    <button
                                      className="btn btn-outline-primary btn-sm add-note"
                                      onClick={this.toggleNoteModal}
                                    >
                                      <AddIcon style={{ color: 'var(--skyblueText) !important' }}  />
                                      <p>Add Note</p>
                                    </button>
                                    <button
                                      className="btn btn-outline-secondary btn-sm ms-2 add-note"
                                      onClick={() =>
                                        this.handleUpdateContact("muted")
                                      }
                                    >
                                        <MuteIcon style={{ color: 'var(--skyblueText) !important' }}  />
                                        <p>
                                        {selectedUser.muted ? "Unmute" : "Mute"}
                                      </p>
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm ms-2 block-cls"
                                      onClick={() =>
                                        this.handleUpdateContact("blocked")
                                      }
                                    >
                                      <img src={block} alt="block" />
                                      <p>
                                        {selectedUser.blocked ? "Unblock" : "Block"}
                                      </p>
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-4 history-pgp">
                                  <Link to={`/history/${selectedUser.address}`} className="btn btn-link text-decoration-none w-100">
                                    <div className="history-detial transaction">
                                      <div className="text-left d-flex timer-cls">
                                        <TimerIcon style={{ color: 'var(--skyblueText) !important' }}  />
                                        <span className="msg-heading">History of transactions</span>
                                      </div>
                                      <div className="arr-right">
                                        <i className=" ri-arrow-right-s-line"></i>
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                        :
                        (
                          <div className="page-profile">
                          <div className="d-lg-flex chat-side">
                            <div className="w-100 user-chat-cls mt-sm-0 chennal-cls">
                              <div className="px-lg-2">
                                <div className="d-flex justify-content-center align-items-center">
                                  <div className="profile-w">
                                    <div className="chat-conversation p-3 chat-conversation-height">
                                        <div className="d-flex justify-content-center">
                                          <div>
                                             {selectedUser.avatar || avatarURL ? (
                                                <div className="second-img rounded-circle" 
                                                style={divStyle1} 
                                                onClick={user.identity.address !== selectedUser.createdBy ? null : this.openChannelAvatarDialog}
                                                {...(user.identity.address === selectedUser.createdBy && {
                                                  "data-tooltip-id": "avatar-tooltip",
                                                  "data-tooltip-content": "Change channel avatar.",
                                                })}>
                                                </div>
                                
                                                ) : (
                                                (
                                                  <>
                                                  {selectedUser.type === "contact" ? user1 
                                                  :
                                                  (selectedUser.type === "channel" ?
                                                    (
                                                        <ChannelAvatar 
                                                        style={{ color: 'var(--skyblue) !important' }}  
                                                        className="pointer"
                                                        onClick={user.identity.address !== selectedUser.createdBy ? null : this.openChannelAvatarDialog}
                                                        {...(user.identity.address === selectedUser.createdBy && {
                                                          "data-tooltip-id": "avatar-tooltip",
                                                          "data-tooltip-content": "Change channel avatar.",
                                                        })}
                                                        />
                                                      ) 
                                                      : (
                                                        <GroupAvatar  
                                                        style={{ color: 'var(--skyblue) !important' }}  
                                                        className="rounded-circle avatar-lg pointer"
                                                        onClick={user.identity.address !== selectedUser.createdBy ? null : this.openChannelAvatarDialog}
                                                        {...(user.identity.address === selectedUser.createdBy && {
                                                          "data-tooltip-id": "avatar-tooltip",
                                                          "data-tooltip-content": "Change group avatar.",
                                                        })}                                        />
                                                      ))
                                                  }
                                                  </>
                                                  )
                                                  
                                                )}
                                          </div>
                                          <Tooltip id="avatar-tooltip" />
                                          <input
                                            type="file"
                                            ref={this.channelfileInputRef}
                                            style={{ display: "none" }}
                                            accept=".jpg,.jpeg,.png"
                                            onChange={this.handlechannelFileChange}
                                          />
                                        </div>
                                        <div className="text-center my-2">
                                          <p>
                                            <strong>{selectedUser.type ? selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1): 'Channel'}: </strong> {selectedUser.users.length > 0 ? selectedUser.users.length  : 0} {selectedUser.users.length > 1 ? "Members" : "Member"}
                                          </p>
                                        </div>
                                        <AvForm onValidSubmit={this.handleUpdateChannel}>
                                        {user.identity.address === selectedUser.createdBy && (
                                          <div className="text-right">
                                          <label className="mr-10px add-member-icon pointer" onClick={this.toggleaddUserModal}
                                            data-tooltip-id="add-members"
                                            data-tooltip-content="Add new members to the channel."
                                          >
                                            <i className="fa fa-user-plus" aria-hidden="true"></i>
                                          </label>
                                          <button className="add-member-icon border-0 bg-none text-center p-0 rounded-circle" type="submit"
                                            data-tooltip-id="update-channel"
                                            data-tooltip-content="Update channel."
                                          >
                                           <i className="fa fa-check m-0" aria-hidden="true"></i>
                                         </button>
                                         <Tooltip id="update-channel"></Tooltip>
                                         <Tooltip id="add-members"></Tooltip>
                                         </div>
                                        )}
                                       
                                          <div className="id-mar">
                                            <Label className="form-label id-color">{selectedUser.type ? selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1): 'Channel'} Name</Label>
                                            <div className="input-with-icon id-input">
                                              <AvField
                                                name="name"
                                                type="text"
                                                className="form-control"
                                                value={selectedUser.name}
                                                readOnly={user.identity.address !== selectedUser.createdBy}
                                                onChange={this.handleChannelInputChange}
                                                validate={{
                                                  required: { value: true, errorMessage:`${selectedUser.type ? selectedUser.type : 'Channel'} name is required.`},
                                                  // minLength: { value: 6, errorMessage: "Channel name must be at least 6 characters." },
                                                  maxLength: { value: 100, errorMessage:`${selectedUser.type ? selectedUser.type : 'Channel'} name cannot exceed 100 characters.` },
                                                }}
                                              />
                                            </div>
                                          </div>
                                          <div className="id-mar bg-cls-txt">
                                            <Label className="form-label id-color">Description</Label>
                                            <div className="input-with-icon id-input ">
                                              <AvField
                                                name="description"
                                                type="textarea"
                                                value={selectedUser.description}
                                                className="form-control custom-placeholder mb-0"
                                                placeholder={`${selectedUser.type ? selectedUser.type : 'Channel'} description`}
                                                readOnly={user.identity.address !== selectedUser.createdBy}
                                                onChange={this.handleChannelInputChange}
                                                validate={{
                                                  required: { value: true, errorMessage: "Description is required." },
                                                  minLength: { value: 10, errorMessage: "Description must be at least 10 characters." },
                                                }}
                                              />
                                            </div>
                                          </div>
                                          {selectedUser.type == 'channel' && (
                                            <div className="id-mar input-with-icon span-icons-cls">
                                            <Label className="form-label id-color">Channel Link</Label>
                                            <div class="input-group mb-3 mobile-hide-input-main">
                                              <span class="input-group-text" id="basic-addon3">
                                                <strong className="mobile-hide-input"> {appUrl} </strong>
                                                <strong className="mobile-show-input">Copy Link</strong>
                                              </span>
                                              <Input type="text" className="form-control custom-placeholder mb-0 border-6-right mobile-hide-input" id="basic-url" aria-describedby="basic-addon3" 
                                                onChange={this.handleChannelInputChange}
                                                readOnly={user.identity.address !== selectedUser.createdBy}
                                                name="link"
                                                value={selectedUser.link}  
                                                validate={{
                                                  required: { value: true, errorMessage: "link is required." },
                                                }}                                              
                                                placeholder="Customize your channel link."

                                              />
                                              <i className="ri-file-copy-line input-group-text pointer"
                                                  data-tooltip-id="id-name-tooltip" 
                                                  data-tooltip-content="Copy channel link."
                                                  onClick={() =>
                                                    this.handleCopy("Channel link",`${appUrl}${selectedUser.link}`)
                                                  }
                                                ></i>
                                            </div>
                                          </div>  
                                          )}                                          
                                          <div>
                                          {selectedUser.users.length === 0 ? (
                                            <p className="text-center">No member found.</p>
                                          ) : (
                                            <>
                                            <Label className="form-label id-color">Members</Label>
                                            <PerfectScrollbar className="member-scroll">
                                            {selectedUser.users.map((member, index) => (
                                                <div
                                                  key={member.id}
                                                  className={`contact-item justify-content-between my-1 ${index === selectedUser.users.length - 1 ? 'last-contact my-1' : ''}`}
                                                  style={{
                                                    // borderLeft:'3px solid #1877f2',
                                                    borderLeft: '3px solid var(--skyblue)',
                                                    backgroundColor: 'var(--memberBkColor)',
                                                    cursor: 'pointer',
                                                    border: '1px solid var(--memberBkbdrColor)',
                                                    borderRadius:' 5px',
                                                  }}
                                                >
                                                  <Label className="d-flex align-items-center">
                                                    <img
                                                      src={member.avatar ? member.avatar : user1}
                                                      alt={member.name}
                                                      className="rounded-circle avatar-sm member-ava"
                                                    />
                                                    <span className="contact-name">
                                                      {member.nickname ? (
                                                        <>
                                                          {member.nickname.length > 16 ? `${member.nickname.substring(0, 15)}...` : member.nickname}
                                                        </>
                                                      ) :
                                                      <>
                                                       {member.identityId.length > 16 ? `${member.identityId.substring(0, 15)}...` : member.identityId}
                                                      </>
                                                      }
                                                    </span>
                                                   
                                                  </Label>
                                                  <span className="contact-name mx-2">
                                                  <div className="member-info">
                                                      {member.role === 'admin' ? (
                                                        <span className="badge bg-success py-2">Group Admin</span>
                                                      ) : (
                                                        <>
                                                        {user.identity.address === selectedUser.createdBy && ( 
                                                          <>
                                                            <i
                                                              className="fa fa-trash text-danger" 
                                                              onClick={() => this.removeMember(selectedUser.id, member.identityId)}
                                                              style={{ cursor: 'pointer', marginRight: '10px' }}
                                                              title="Remove Member"
                                                              data-tooltip-id="remove-member"
                                                              data-tooltip-content="Remove member from channel."
                                                            ></i>
                                                          </>)}
                                                          <i
                                                            className="fa fa-eye" 
                                                            onClick={() => this.viewMember(member)}
                                                            style={{ cursor: 'pointer', marginRight: '10px' }}
                                                            title="View member details"
                                                            data-tooltip-id="remove-member"
                                                            data-tooltip-content="View member details."
                                                          ></i>
                                                          </>
                                                      )}
                                                    </div>
                                                  </span>
                                                </div>
                                            ))}
                                            </PerfectScrollbar>
                                            </>
                                          )}
                                          <Tooltip id="remove-member"></Tooltip>
                                          </div>
                                        </AvForm>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        )
                      }
                    </>
                  ) : (
                    <div>
                      {Object.keys(selectedUser).length > 0 ? (
                        <div
                            onClick={() =>
                              this.setState({ contextMenu: { ...contextMenu, visible: false } })
                            } // Close context menu on click
                          >                  
                          <PerfectScrollbar className="chat-conversation-height-cls" 
                            ref={(ref) => {
                              if (ref) {
                                this.chatContainerRef = ref._container; 
                              }
                            }}
                          >
                          <div className="chat-conversation p-3">
                            <ul className="list-unstyled mb-0">
                              <PerfectScrollbar className="main-point-cls">
                                {selectedUser.state === 'request' ? (
                                  <li className="text-center">
                                   You've been invited to join the chat.                              
                                  </li>
                                ) :(
                                <>
                                 {selectedUser.state === 'blocked' || selectedUser.state === 'pending' ? (
                                    <li className="text-center">
                                      {selectedUser.state === 'pending' ? (
                                        <span>The contact request has been sent! Awaiting response.</span> 
                                      ) : (
                                        <span>Your request has been declined.</span>
                                      )}
                                      
                                    </li>
                                  ) :(
                                    <>
                                     {/* Incoming Call Modal */}
                                    {this.state.showIncomingCallModal && (
                                        <Modal isOpen={this.state.showIncomingCallModal} className="modal-dialog-centered modal-sm">
                                            <div className="bg-modal">
                                              
                                                <ModalBody className="custom-modal-body text-center">
                                                    <h3>Incoming Call</h3>
                                                    <img 
                                                        src={this.state.caller.avatar} 
                                                        className="rounded-circle" 
                                                        style={{ height: '130px', width: '130px', objectFit: 'cover' }} 
                                                        alt="Caller Avatar" 
                                                    />
                                                    <p>{this.state.caller.name}</p>
                                                    <span className="p-2 mx-2 rounded-circle bg-success text-white">
                                                      <i className="mdi mdi-phone" onClick={this.answerCall}></i>
                                                    </span>
                                                    <span className="p-2 rounded-circle bg-danger text-white">
                                                    <i className="mdi mdi-phone" onClick={this.leaveCall}></i>
                                                    </span>
                                                </ModalBody>
                                            </div>
                                        </Modal>
                                    )}

                                    {/* Ongoing Call Modal */}
                                    {this.state.showOngoingCallModal && (
                                        <Modal isOpen={this.state.showOngoingCallModal} className="modal-dialog-centered modal-sm">
                                            <div className="bg-modal">
                                                <ModalBody className="custom-modal-body text-center">
                                                    <h2 className="msg-heading">Calling</h2>
                                                    <img 
                                                        src={this.state.caller?.avatar ?? selectedUser.avatar} 
                                                        className="rounded-circle" 
                                                        style={{ height: '130px', width: '130px', objectFit: 'cover' }} 
                                                        alt="Caller Avatar" 
                                                    />
                                                    <p>{this.state.caller?.name ?? this.state.selectedUser.name}</p>
                                                    {this.state.callStatus && <p>{this.state.callStatus}</p>}
                                                    <p>Duration: {this.state.callDuration}</p>
                                                    <span className="p-2 rounded-circle bg-danger text-white">
                                                    <i className="mdi mdi-phone" onClick={this.leaveCall}></i>
                                                    </span>
                                                </ModalBody>
                                            </div>
                                        </Modal>
                                    )} 
                                    {Object.keys(messagesGroupedByDate).length >
                                    0 ? (
                                      Object.keys(messagesGroupedByDate).map(
                                        (date, idx) => (
                                          <React.Fragment key={idx}>
                                            <li className="text-center">
                                                {dateFormatByFlags(date,this.props.user?.identity?.settings, true, true, false,false,false,settings?.timeFormat)}
                                            </li>
                                            {messagesGroupedByDate[date].map(
                                              (message, key) => (
                                                <li
                                                  key={key}
                                                  className={
                                                    message.receiver ===
                                                    selectedUser.address || (message.sender && message.sender ==
                                                      this.state.user.identity.address && (selectedUser.type == "group" || selectedUser.type == "channel"))
                                                      ? "right"
                                                      : ""
                                                  }
                                                  style={{ paddingRight: "20px" }}
                                                >
                                                  <div className="conversation-list">
                                                    <div className="ctext-wrap">
                                                      <p className="chat-time mb-0">
                                                        {dateFormatByFlags(message.createdAt,this.props.user?.identity?.settings, false, false, true,false,false,settings?.timeFormat)}
                                                      </p>
                                                      <div className="ctext-wrap-content">
                                                      {message.type === 'payment' ? (
                                                          <div className="payment-container">
                                                            
                                                              {message.payment?.isPaid && message.receiver === this.state.user.identity.address ? (
                                                                <div className="payment-card pointer" onClick={() => this.handleDownload(message.fileUrl,message.id,message.fileName)}>
                                                                    <Button className="btn btn-download-file-payment "
                                                                      data-tooltip-id="chat-tooltip"
                                                                      data-tooltip-content="Download file."
                                                                    >
                                                                      {/* <img src={downloadIcon} alt="download icon" /> */}
                                                                      <DownloadIcon style={{ color: 'var(--skyblue) !important' }} className="svg"/>
                                                                      <p>Download</p>
                                                                    </Button>
                                                                </div>
                                                              ):(
                                                                <>
                                                                  <div className="payment-card">
                                                                    <div className="payment-icon">
                                                                      {/* <img src={fileAttach} alt="neuro file" /> */}
                                                                      <FileAttach style={{ color: 'var(--skyblue) !important' }} className="svg"/>
                                                                    </div>
                                                                    <div className="payment-description">
                                                                      {message.payment?.isPaid && message.sender === this.state.user.identity.address ? (
                                                                        <span>Opened</span>
                                                                      ):
                                                                      (
                                                                      <span>Pay to Unlock Attachment</span>
                                                                      )}
                                                                    </div>
                                                                  </div>
                                                                </>
                                                              )}
                                                            
                                                            <div>
                                                              <div className="payment-description-main">
                                                                {message.payment?.description}
                                                              </div>
                                                              <div className="d-flex justify-content-between align-items-center">
                                                                  <div className="payment-amount">
                                                                  {/* {message.payment?.currency || "$"} */}
                                                                    <span>{message.payment?.currency === "EUR" ? "€" : "$"}
                                                                    {message.payment?.amount || 0}</span>
                                                                  </div>
                                                                  {message.sender === this.state.user.identity.address ? (
                                                                    <>
                                                                    {message.payment?.isPaid ? (
                                                                      <div className="payment-icon">
                                                                        <i className="fa fa-check" aria-hidden="true"></i>
                                                                      </div>
                                                                    ):(
                                                                      <Button
                                                                          className="btn btn-payment edit"
                                                                          onClick={() => this.editPayment(message)}
                                                                      >
                                                                        Edit
                                                                      </Button>
                                                                    )}
                                                                    </>
                                                                  ) : (
                                                                    <>
                                                                    {message.payment?.isPaid ? (
                                                                        <strong>Sended</strong>
                                                                      ):(
                                                                        <Button
                                                                          className="btn btn-payment pay"
                                                                          onClick={() => this.openPayForm(message)}
                                                                        >
                                                                          Pay
                                                                        </Button>
                                                                      )}
                                                                    </>
                                                                  )}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        ) : (
                                                          <>
                                                            {message.fileUrl ? (
                                                              message.fileType ===
                                                              "image" ? (
                                                                <div>
                                                                  {message.sender && 
                                                                    message.sender !== this.state.user.identity.address &&
                                                                    selectedUser.type === "group" && (
                                                                      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                                                        {message.senderIdentity?.avatar && (
                                                                          <img
                                                                            src={message.senderIdentity.avatar}
                                                                            alt="Sender Avatar"
                                                                            style={{
                                                                              width: "30px",
                                                                              height: "30px",
                                                                              borderRadius: "50%",
                                                                              marginRight: "8px",
                                                                            }}
                                                                          />
                                                                        )}
                                                                        <p
                                                                          style={{
                                                                            color: this.getSenderColor(message.sender),
                                                                            margin: 0,
                                                                          }}
                                                                        >
                                                                          {message.senderIdentity
                                                                            ? message.senderIdentity.nickname || message.senderIdentity.address
                                                                            : message.sender}
                                                                        </p>
                                                                    </div>
                                                                  )}
                                                                  <img
                                                                    src={
                                                                      message.fileUrl
                                                                    }
                                                                    alt={
                                                                      message.fileName ||
                                                                      "Image"
                                                                    }
                                                                    style={{
                                                                      maxWidth: "150px",
                                                                      maxHeight: "150px",
                                                                      cursor: "pointer",
                                                                    }}
                                                                    data-tooltip-id="tooltip"
                                                                    data-tooltip-content="View image."
                                                                    onClick={() =>
                                                                      this.openMediaModal(message.fileUrl, "image")
                                                                    }
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
                                                                  <p className="mb-0">
                                                                    {message.content}
                                                                  </p>
                                                                </div>
                                                              ) : message.fileType ===
                                                                "video" ? (
                                                                  <>
                                                                  {message.sender && 
                                                                    message.sender !== this.state.user.identity.address &&
                                                                    selectedUser.type === "group" && (
                                                                      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                                                        {message.senderIdentity?.avatar && (
                                                                          <img
                                                                            src={message.senderIdentity.avatar}
                                                                            alt="Sender Avatar"
                                                                            style={{
                                                                              width: "30px",
                                                                              height: "30px",
                                                                              borderRadius: "50%",
                                                                              marginRight: "8px",
                                                                            }}
                                                                          />
                                                                        )}
                                                                        <p
                                                                          style={{
                                                                            color: this.getSenderColor(message.sender),
                                                                            margin: 0,
                                                                          }}
                                                                        >
                                                                          {message.senderIdentity
                                                                            ? message.senderIdentity.nickname || message.senderIdentity.address
                                                                            : message.sender}
                                                                        </p>
                                                                    </div>
                                                                  )}
                                                                  <div
                                                                    style={{
                                                                      maxWidth: "150px",
                                                                      maxHeight: "150px",
                                                                      cursor: "pointer",
                                                                      position: "relative",
                                                                      overflow: "hidden",
                                                                      borderRadius: "8px",
                                                                    }}
                                                                    onClick={() => this.openMediaModal(message.fileUrl, "video")}
                                                                    data-tooltip-id="chat-tooltip"
                                                                    data-tooltip-content="Play video."
                                                                    onContextMenu={(e) =>
                                                                      this.showContextMenu(e, message.id, message.fileUrl, "video", message.fileName)
                                                                    }
                                                                  >
                                                                    <video
                                                                      src={message.fileUrl}
                                                                      style={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "cover",
                                                                        pointerEvents: "none",
                                                                      }}
                                                                    />
                                                                    <div
                                                                      style={{
                                                                        position: "absolute",
                                                                        top: "50%",
                                                                        left: "50%",
                                                                        transform: "translate(-50%, -50%)",
                                                                        background: "rgba(0, 0, 0, 0.5)",
                                                                        borderRadius: "50%",
                                                                        width: "40px",
                                                                        height: "40px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                      }}
                                                                    >
                                                                      <i
                                                                        className="fa fa-play"
                                                                        style={{ color: "white", fontSize: "16px" }}
                                                                      ></i>
                                                                    </div>
                                                                    <p className="mb-0" style={{ marginTop: "10px", textAlign: "center" }}>
                                                                      {message.content}
                                                                    </p>
                                                                  </div>
                                                                </>
                                                              ) : message.fileType ===
                                                                "document" ? (
                                                                  <>
                                                                    {message.sender && 
                                                                      message.sender !== this.state.user.identity.address &&
                                                                      selectedUser.type === "group" && (
                                                                        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                                                          {message.senderIdentity?.avatar && (
                                                                            <img
                                                                              src={message.senderIdentity.avatar}
                                                                              alt="Sender Avatar"
                                                                              style={{
                                                                                width: "30px",
                                                                                height: "30px",
                                                                                borderRadius: "50%",
                                                                                marginRight: "8px",
                                                                              }}
                                                                            />
                                                                          )}
                                                                          <p
                                                                            style={{
                                                                              color: this.getSenderColor(message.sender),
                                                                              margin: 0,
                                                                            }}
                                                                          >
                                                                            {message.senderIdentity
                                                                              ? message.senderIdentity.nickname || message.senderIdentity.address
                                                                              : message.sender}
                                                                          </p>
                                                                      </div>
                                                                    )}
                                                                    <div 
                                                                    className={`document-container`}
                                                                    >
                                                                      <span
                                                                        onClick={(e) =>
                                                                          this.showContextMenu(e, message.id, message.fileUrl, "document", message.fileName)
                                                                        }
                                                                        className={`${
                                                                          message.receiver === selectedUser.address ||
                                                                          (message.sender === this.state.user.identity.address &&
                                                                            (selectedUser.type === "group" || selectedUser.type === "channel"))
                                                                            ? "msg-text"
                                                                            : "secondary-text"
                                                                        }`}
                                                                      >
                                                                        <i className="fa fa-file px-2" aria-hidden="true"></i>
                                                                          {message.fileName}
                                                                          <Button className="btn btn-download-file pointer"
                                                                            onClick={() => this.handleDownload(message.fileUrl,message.id,message.fileName)}
                                                                            data-tooltip-id="chat-tooltip"
                                                                            data-tooltip-content="Download file."
                                                                          >
                                                                            <i 
                                                                              className={`fa fa-download`}                                                                          
                                                                            ></i>
                                                                        </Button>
                                                                      </span>
                                                                      {/* {this.state.downloadProgress[message.id] !== undefined && (
                                                                        <span className="progress-indicator">
                                                                          {" "}
                                                                          - {this.state.downloadProgress[message.id]}%
                                                                        </span>
                                                                      )} */}
                                                                      <p className="mb-0">
                                                                        {message.content}
                                                                      </p>
                                                                    </div>
                                                                  </>
                                                                ) : (
                                                                  <p className="mb-0">
                                                                    {message.content}
                                                                  </p>
                                                                )
                                                              ) : (
                                                                <p className="mb-0">
                                                                  {message.sender && 
                                                                    message.sender !== this.state.user.identity.address &&
                                                                    selectedUser.type === "group" && (
                                                                      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                                                        {message.senderIdentity?.avatar && (
                                                                          <img
                                                                            src={message.senderIdentity.avatar}
                                                                            alt="Sender Avatar"
                                                                            style={{
                                                                              width: "30px",
                                                                              height: "30px",
                                                                              borderRadius: "50%",
                                                                              marginRight: "8px",
                                                                            }}
                                                                          />
                                                                        )}
                                                                        <p
                                                                          style={{
                                                                            color: this.getSenderColor(message.sender),
                                                                            margin: 0,
                                                                          }}
                                                                        >
                                                                          {message.senderIdentity
                                                                            ? message.senderIdentity.nickname || message.senderIdentity.address
                                                                            : message.sender}
                                                                        </p>
                                                                      </div>
                                                                    )}
                                                                  {message.content}
                                                                </p>
                                                              )}
                                                          </>
                                                        )}
                                                      </div>
                                                      {(message.sender &&  message.sender == this.state.user.identity.address) 
                                                        && (
                                                        <div className="message-status">
                                                          {message.status ===
                                                            "unread" && (
                                                              <i className="fas fa-check "></i>
                                                          )}
                                                          {message.status ===
                                                            "delivered" && (
                                                            <span className="double-tick text-muted">
                                                              <i className='fas fa-check-double'></i>
                                                            </span>
                                                          )}
                                                          {message.status ===
                                                            "read" && (
                                                            <span className="double-tick" >
                                                              <i className='fas fa-check-double' style={{ color: 'var(--skyblueText) !important' }}></i>
                                                            </span>
                                                          )}
                                                        </div>
                                                      )} 
                                                      <Tooltip id="tooltip" style={{zIndex:"1000000 !important"}} />
                                                    </div>
                                                  </div>                                             
                                                </li>
                                              )
                                            )}
                                          </React.Fragment>
                                        )
                                      )
                                      ) : (
                                        <li className="text-center">
                                          No messages to display.
                                        </li>
                                    )} 
                                    </>
                                  )}
                                </>
                              )}
                              </PerfectScrollbar>
                            </ul>
                          </div>
                          
                          </PerfectScrollbar>
                          <div className="chat-input-section">
                            {this.state.uploadProgress > 0  && !this.state.paymentFormConfig.isVisible ? (
                              <div className="file-upload-progress">
                                <div className="progress-bar-container d-flex align-items-center">
                                  {previewFile?.previewUrl ? (
                                    <>
                                        {previewFile.fileType === 'image' && (
                                          <img
                                            src={previewFile.previewUrl}
                                            alt={previewFile.fileName}
                                            style={{ width: '60px', height: 'auto' }}
                                          />
                                        )}
                                        {previewFile.fileType === 'video' && (
                                          <video controls width="150">
                                            <source src={previewFile.previewUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                          </video>
                                        )}
                                        {previewFile.fileType === 'document' && (
                                          <div>
                                            <i className="fa fa-file" /> {previewFile.fileName}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <i className="fa fa-file" style={{fontSize: "17px"}}/>
                                    )}
                                    <div className="file-details">
                                      <span className="file-name px-2">{this.state.fileName}</span>
                                      <span className="file-size">{this.state.fileSize}</span>
                                    </div>
                                  </div>
                                  <div className="progress-bar">
                                    <div
                                      className="progress-fill"
                                      style={{ width: `${this.state.uploadProgress}%` }}
                                    >
                                      {this.state.uploadProgress}%
                                    </div>
                                  </div>
                                </div>
                              ):(
                              <>
                                {previewFile && (
                                  <div className="previews">
                                    <FilePreview
                                      preview={previewFile}
                                      onRemove={this.handleRemoveFile}
                                      className="mx-2"
                                    />
                                  </div>
                                )}
                              </>
                            )}
                            {selectedUser.blocked ? (
                              <p className="text-center">
                                <span
                                  className="py-2 pointer"
                                  onClick={() =>
                                    this.handleUpdateContact("blocked")
                                  }
                                >
                                  <p  className="text-icon">
                                    <i className="fa fa-lock p-0"></i> You blocked this contact. Tap to unblock.
                                  </p>
                                </span>
                              </p>
                            ) : (
                              <Row>
                                {selectedUser.type === "contact" ? (
                                  <>
                                    {selectedUser.state === 'request' ? (
                                      <>
                                          <div className="actions-cls text-center">
                                            <Button className="me-2 reject-btn" onClick={() => this.handleUpdateContactState('block')}>
                                                BLOCK
                                              </Button>
                                              <Button className="btn cryto-btn" onClick={() => this.handleUpdateContactState('accepted')}>
                                                ACCEPT
                                              </Button>
                                            </div>
                                      </>
                                    ):
                                    (
                                      <>
                                      {(!["request", "blocked", "pending"].includes(selectedUser.state)  && selectedUser.name !== "BotAi") && (
                                        <>
                                        <li className="list-inline-item col-lg-1 d-flex justify-content-center attach-file-cls p-0">
                                        <Dropdown
                                          isOpen={this.state.other3}
                                          toggle={() =>
                                            this.setState({
                                              other3: !this.state.other3,
                                            })
                                          }
                                        >
                                          <DropdownToggle
                                            className="btn nav-btn "
                                            tag="i"
                                          >
                                            <AttachIcon style={{ color: 'var(--skyblueText) !important' }} className="svg"/>
                                            {/* <img src={attach} style={{ color: 'var(--skyblue) !important' }} className="svg" alt="attach"/> */}
                                          </DropdownToggle>
                                          <DropdownMenu className="dropdown-menu-end-cls">
                                            <DropdownItem
                                              className="drop-icons"
                                              href="#"
                                              onClick={this.openFileDialog}
                                            >
                                              <i className="fa fa-image"></i>
                                              Photos or videos
                                            </DropdownItem>
                                            <DropdownItem
                                              className="drop-icons"
                                              href="#"
                                              onClick={this.openDocDialog}
                                            >
                                              <i className="ri-file-line"></i>
                                              Document
                                            </DropdownItem>
                                            <DropdownItem
                                              href="#"
                                              className="drop-icons"
                                              onClick={this.openPaymentForm}
                                            >
                                              <i className="ri-currency-line"></i>
                                              Create payment
                                            </DropdownItem>
                                          </DropdownMenu>
                                        </Dropdown>
                                        </li>
                                        <Col className="p-0">
                                          <div className="position-relative">
                                            {/* <Input
                                              type="text"
                                              value={this.state.curMessage}
                                              onChange={(e) => {
                                                this.setState({
                                                  curMessage: e.target.value,
                                                });
                                              }}
                                              className="form-control chat-input"
                                              placeholder="Type your message..."
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  this.addMessage(selectedUser.name);
                                                }
                                              }}
                                            /> */}
                                            <textarea
                                                value={this.state.curMessage}
                                                onChange={(e) => {
                                                  this.setState({ curMessage: e.target.value }, () => {
                                                    const textarea = e.target;
                                                    textarea.style.height = 'auto'; 
                                                    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
                                                  });
                                                }}
                                                className="form-control chat-input"
                                                placeholder="Type your message..."
                                                style={{
                                                  overflow: 'hidden',
                                                  resize: 'none',
                                                  maxHeight: '120px',
                                                  lineHeight: '1.5',
                                                }}
                                                rows={1}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    this.addMessage(selectedUser.name);
                                                  }
                                                }}
                                              />
                                          </div>
                                        </Col>
                                        <Col xs={{ size: "auto" }}>
                                          <div className="send-msg">
                                            <i
                                              type="button"
                                              color="primary"
                                              onClick={() =>
                                                this.addMessage(selectedUser.name)
                                              }
                                              className="mdi mdi-send"
                                            ></i>
                                          </div>
                                        </Col>
                                      </>
                                      )}
                                    </>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {user.identity.address ===
                                      selectedUser.createdBy && selectedUser.type ==='channel' ||  selectedUser.type ==='group' ? (
                                      <>
                                        <li className="list-inline-item col-lg-1 d-flex justify-content-center attach-file-cls p-0">
                                          <Dropdown
                                            isOpen={this.state.other3}
                                            toggle={() =>
                                              this.setState({
                                                other3: !this.state.other3,
                                              })
                                            }
                                          >
                                            <DropdownToggle
                                              className="btn nav-btn "
                                              tag="i"
                                            >
                                              <AttachIcon style={{ color: 'var(--skyblue) !important' }} className="svg"/>
                                            </DropdownToggle>
                                            <DropdownMenu className="dropdown-menu-end-cls">
                                              <DropdownItem
                                                href="#"
                                                className="drop-icons"
                                                onClick={this.openFileDialog}
                                              >
                                                <i className="fa fa-image"></i>
                                                Photos or videos
                                              </DropdownItem>
                                              <DropdownItem
                                                href="#"
                                                className="drop-icons"
                                                onClick={this.openDocDialog}
                                              >
                                                <i className="ri-file-line"></i>
                                                Document
                                              </DropdownItem>
                                              {/* <DropdownItem
                                                href="#"
                                                className="drop-icons"
                                              >
                                                <i className="ri-currency-line"></i>
                                                Create payment
                                              </DropdownItem> */}
                                            </DropdownMenu>
                                          </Dropdown>
                                        </li>
                                        <Col className="p-0">
                                          <div className="position-relative">
                                            <textarea
                                                  value={this.state.curMessage}
                                                  onChange={(e) => {
                                                    this.setState({ curMessage: e.target.value }, () => {
                                                      const textarea = e.target;
                                                      textarea.style.height = 'auto'; 
                                                      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
                                                    });
                                                  }}
                                                  className="form-control chat-input"
                                                  placeholder="Type your message..."
                                                  style={{
                                                    overflow: 'hidden',
                                                    resize: 'none',
                                                    maxHeight: '120px',
                                                    lineHeight: '1.5',
                                                  }}
                                                  rows={1}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                      e.preventDefault();
                                                      this.addMessage(selectedUser.name);
                                                    }
                                                  }}
                                                />
                                          </div>
                                        </Col>
                                        <Col xs={{ size: "auto" }}>
                                          <div className="send-msg">
                                            <i
                                              type="button"
                                              color="primary"
                                              onClick={() =>
                                                this.addMessage(
                                                  selectedUser.name
                                                )
                                              }
                                              className="mdi mdi-send"
                                            ></i>
                                          </div>
                                        </Col>
                                      </>
                                    )
                                  :(
                                    <>
                                    <span
                                      className="py-2 "
                                    >
                                      <p className="text-center">
                                        Only channel admin can send messages.
                                      </p>
                                    </span>
                                    </>
                                  )}
                                  </>
                                )}
                              </Row>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Container>
                            <div className="cancel-point">
                              <div className="width-cls">
                                <div className="create-new-cls">
                                  <div
                                    className="text-center"
                                    onClick={this.toggleNewContactModal}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <div className="create-new">
                                      <AddNewIcon style={{ color: 'var(--skyblueText) !important',width:50,height:50, }}/>
                                      <div className="mt-3">
                                        <h3 className="msg-heading">Create New</h3>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Container>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Container>
          <ModelForm
            isOpen={newContactModal}
            toggle={this.toggleNewContactModal}
            handleSubmit={this.handleFormSubmit}
            fields={fields}
            errors={errors}
            title="New Contact"
            handleInputChange={this.handleInputChange}
            toggleQRCodeModal={this.toggleQRCodeModal}
            handleSearchChange={this.handleSearchChange}
            hasQrcode={true}
            hasSearch={true}
          />
          <ModelForm
            isOpen={noteModal}
            toggle={this.toggleNoteModal}
            handleSubmit={this.handleNoteSubmit}
            fields={notefields}
            errors={errors}
            title="Add Note"
            handleInputChange={this.handleInputChange}
          />
          <ModelForm
            isOpen={channelModal}
            toggle={this.toggleChannelModal}
            handleSubmit={this.handleChannelSubmit}
            fields={channelFields}
            errors={errors}
            title="Add New Channel"
            type="channel"
            handleInputChange={this.handleInputChange}
          />
          <ModelForm
            isOpen={groupModal}
            toggle={this.toggleGroupModal}
            handleSubmit={this.handleGroupSubmit}
            fields={groupFields}
            errors={errors}
            title="Add New Group"
            handleInputChange={this.handleInputChange}
          />
          <ModelContact
            isOpen={isaddUserModalOpen}
            toggle={this.toggleaddUserModal}
            title="Add Members"
            contacts={chats.filter((c) => c?.name !== "BotAi")}
            members={channelMembers}
            onSubmit={this.handleAddUserSubmit}
          />
           <Modal isOpen={showSelectedMemberModal} className="modal-dialog-centered">
          <div className="bg-modal">
            <ModalHeader className="modal-header-custom pb-1">
              <h2 className="msg-heading">User Details</h2>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.handleCloseModal}>
                <span aria-hidden="true">&times;</span>
              </button>
            </ModalHeader>
            <ModalBody className="custom-modal-body">
              {selectedMember ? (
                <>
                  <div className="text-center">
                    <img
                        src={selectedMember.avatar ? selectedMember.avatar : user1}
                        alt={selectedMember.nickname}
                        className="rounded-circle member-detail member-ava"
                      />
                    <p className="m-0">
                      <Label>Name:</Label>{" "} {selectedMember.nickname || "N/A"}
                    </p>
                    <p className="m-0">
                      <Label>Address:</Label> {selectedMember.identityId}
                    </p>
                  </div>                                               
                </>
              ) : null}
              </ModalBody>
            </div>
          </Modal>
          <DynamicModal
            show={paymentFormConfig.isVisible}
            onClose={() => this.openPaymentForm}
            title={paymentFormConfig.title}
            content={paymentFormConfig.content}
          >   
          </DynamicModal>
          <DynamicModal
            show={payFormConfig.isVisible}
            onClose={() => this.hideModal("payFormConfig")}
            title={payFormConfig.title}
            content={payFormConfig.content}
          >
          </DynamicModal>
          <Modal isOpen={showSuccessModal} className="modal-dialog-centered">
          <div className="bg-modal">
            <ModalHeader className="modal-header-custom pb-1">
              <h2 className="msg-heading">Congratulations!</h2>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={this.handleCloseSuccessModal}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </ModalHeader>
            <ModalBody className="custom-modal-body">
              <div className="text-center">
                <CongratIcon  style={{ color: 'var(--skyblue) !important' }}  className="congrate-icon-cls"/>
                <h1 className="heading-bold">
                  ${payMessage?.payment?.amount}
                </h1>
                <p>Purchase Successfully</p>
                <Button
                  className="btn w-100 cryto-btn savebtn mt-2"
                  onClick={this.handleCloseSuccessModal}
                >
                  OK
                </Button>
              </div>
            </ModalBody>
          </div>
        </Modal>
          {this.renderQRCodeModal()}
          <input
            type="file"
            accept="image/*,video/*"
            id="fileInput"
            ref={this.fileInput}
            style={{ display: "none" }}
            onChange={this.handleFileChanged}
          />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.json"
            id="docInput"
            ref={this.docInput}
            style={{ display: "none" }}
            onChange={this.handleFileChanged}
          />
         {contextMenu.visible && (
          <div
            className="context-menu"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              position: "absolute",
              zIndex: 1000,
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "5px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: "5px 0" }}>
              <li
                onClick={() => this.handleDownload(contextMenu.fileUrl,contextMenu.id,contextMenu.fileName)}
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                Download
              </li>
            </ul>
          </div>
        )}
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
      </React.Fragment>
    );
  }
}

Chat.propTypes = {
  chats: PropTypes.array,
  groups: PropTypes.array,
  contacts: PropTypes.array,
  messages: PropTypes.array,
  onGetChats: PropTypes.func,
  onGetGroups: PropTypes.func,
  onGetContacts: PropTypes.func,
  onGetMessages: PropTypes.func,
  onAddMessage: PropTypes.func,
  onPayMessage: PropTypes.func,
  updateContact: PropTypes.func,
};

const mapStateToProps = ({ chat, User, contact}) => ({
  chats: chat.chats,
  groups: chat.groups,
  contacts: chat.contacts,
  messages: chat.messages,
  user: User.user,
  channelSuccess: contact.channelSuccess,
  createContactSuccess: contact.createContactSuccess,
  createContactError: contact.createContactError,
  channel:contact.channel
});

const mapDispatchToProps = (dispatch) => ({
  onGetChats: () => dispatch(getChats()),
  onGetGroups: () => dispatch(getGroups()),
  onGetContacts: (searchQuery) => dispatch(getContacts(searchQuery)),
  onGetMessages: (receiver, sender, channelId) =>
    dispatch(getMessages(receiver, sender, channelId)),
  clearChat: (receiver, sender, channelId) => dispatch(clearChat(receiver, sender, channelId)),
  onAddMessage: (message,id) => dispatch(addMessage(message,id)),
  updatePaymentRequest: (message,callback) => dispatch(updatePaymentRequest(message,callback)),
  onPayMessage: (message,id,callback) => dispatch(payMessage(message,id,callback)),
  createContact: (newContactName, newContactAddress,callback) =>
    dispatch(createContact(newContactName, newContactAddress,callback)),
  updateBlocked: (contactId, isBlocked) =>
    dispatch(updateBlocked(contactId, isBlocked)),
  updateMuted: (contactId, isMuted) =>
    dispatch(updateMuted(contactId, isMuted)),
  updateNote: (contactId, note) => dispatch(updateNote(contactId, note)),
  updateContact: (contactId, value, field, itemType,callback) =>
    dispatch(updateContact(contactId, value, field, itemType,callback)),
  deleteChat: (id, type) => dispatch(deleteChat(id, type)),
  selectUser: (user) => dispatch(selectUser(user)),
  createChannel: (newChannelName, avatar, description, createdBy,type) =>
    dispatch(createChannel(newChannelName, avatar, description, createdBy,type)),
  addChannelUser: (channelId, members,callback) =>
    dispatch(addChannelUser(channelId, members,callback)),
  removeChannelUser: (channelId, address) =>
    dispatch(removeChannelUser(channelId, address)),
  changeChannelAvatar: (avatar, channelId) =>
    dispatch(changeChannelAvatar(avatar, channelId)),
  updateChannel: (channelData,callback) =>dispatch(updateChannel(channelData,callback)),
  messageRead: (message) =>dispatch(messageRead(message)),
  updateUnreadCount: (id,unreadCount) =>dispatch(updateUnreadCount(id,unreadCount)),
  removeMember: (channelId, address ,callback) =>
    dispatch(removeMember(channelId, address,callback)),
  fetchIdentity: (address,nickname,callback) =>
    dispatch(fetchIdentity(address,nickname, callback)),
  changePreloader: (value) =>dispatch(changePreloader(value)),
  updateSuccess: (contact) =>dispatch(updateSuccess(contact)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Chat));
