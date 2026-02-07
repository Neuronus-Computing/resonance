import React, { createContext, useState, useEffect, useRef } from "react";
import Peer from "simple-peer/simplepeer.min.js";
import socket from "../util/socket";
import { useSelector, useDispatch } from "react-redux";
import { Modal, ModalBody } from "reactstrap";
import { walletSuccess, getContacts } from '../store/actions';

export const CallContext = createContext();

const CallProvider = ({ children }) => {
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState(null);
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callStartTime, setCallStartTime] = useState(null);
    const [callDuration, setCallDuration] = useState("00:00");
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [ringtone, setRingtone] = useState(null);
    const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
    const [showOngoingCallModal, setShowOngoingCallModal] = useState(false);
    const [calling, setCalling] = useState(false);
    const [callTo, setCallTo] = useState("");
    const [callStatus, setCallStatus] = useState("");

    const connectionRef = useRef(null);
    const callTimerRef = useRef(null);
    const user = useSelector((state) => state.User.user);
    const selectedUser = useSelector((state) => state.chat.selectedUser || null);
    const ringtoneRef = useRef(null);
    const dispatch = useDispatch(); 
    useEffect(() => {
        socket.connect()
        const loginToSocket = () => {
            const token = localStorage.getItem("authToken");
            const defaultIdentityAddress = localStorage.getItem("identityAddress");

            if (token && defaultIdentityAddress) {
                socket.emit("login", { token, defaultIdentityAddress });
            } else {
                console.error("Token or identity not found in localStorage.");
            }
        };
        loginToSocket();
        attachCallListeners();
        const handleVisibilityChange = () => {    
            if (document.visibilityState === "visible") {
                if (!socket.connected) {
                    socket.connect();
                    socket.once("connect", () => {
                        loginToSocket();
                        attachCallListeners();
                    });
                } 
            }
        };
        socket.on("contactRequestReceived", (contact) => {
            dispatch(getContacts(null));
          });
        document.addEventListener("visibilitychange", handleVisibilityChange);
    
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            socket.off("connect");
            // socket.disconnect();
        };
        
    }, []);
    useEffect(() => {
        socket.on("incomingCall", ({ signal, from, details }) => {
            stopCallTimer();
            if (callAccepted) {
                socket.emit("userBusy", { to: from });
                return;
            }
            playRingtone();
            setReceivingCall(true);
            setCaller({ ...details, from });
            setCallerSignal(signal);
            setShowIncomingCallModal(true);
        });
        socket.on("startTime", ({ startTime }) => {
            setCallStartTime(startTime);
            startCallTimer(startTime)
        });
        socket.on("walletCreated", ({wallet}) => {
            dispatch(walletSuccess(wallet));
        });
        // socket.on("callAccepted", ({ signal, startTime }) => {
        //     setCallAccepted(true);
        //     setCallStartTime(startTime);
        //     startCallTimer(startTime);
        
        //     if (connectionRef.current) {
        //         connectionRef.current.signal(signal);
        //     } else {
        //         console.error("Peer connection is not initialized");
        //     }
        // });
       
        socket.on("callEndedNow", leaveCall);
        socket.on("callRejected", leaveCall);
        return () => {
            socket.off("incomingCall");
            // socket.off("callAccepted");
            socket.off("callEndedNow");
            socket.off("callRejected");
            socket.off("walletCreated");
            socket.off("userBusy");
        };
    }, [callAccepted]);
    const playRingtone = () => {
        if (!ringtoneRef.current) {
            ringtoneRef.current = new Audio("/ringtone.mp3");
            ringtoneRef.current.loop = true;
        }
        
        ringtoneRef.current.play().catch(error => {
            console.error("Error playing ringtone:", error);
        });
    };
    
    const stopRingtone = () => {
        if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
        }
    };
    const startCallTimer = (startTime) => {
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
        setCallDuration("00:00")
        callTimerRef.current = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = elapsedTime % 60;
            setCallDuration(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
        }, 1000);
    };

    const stopCallTimer = () => {
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
        setCallDuration("00:00");
    };
    const answerCall = async () => {
        if (callAccepted) return;
        stopRingtone();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(stream);
            setCallStatus("Connecting..."); 
            setCallAccepted(true);
            setShowIncomingCallModal(false);
            setShowOngoingCallModal(true);
            const localAudio = document.createElement("audio");
            localAudio.srcObject = stream;
            localAudio.muted = true;  
            localAudio.autoplay = true;
            document.body.appendChild(localAudio);
            // const peer = new Peer({ initiator: false, trickle: false, stream });
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream,
                config: {
                    iceTransportPolicy: "relay",
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" }, 
                        { urls: "stun:stun1.l.google.com:19302" },
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
                socket.emit("answerCall", { signal: data, to: caller.from, from:user.identity.address });
            });
            peer.on("stream", (userStream) => {
                const audioElement = document.createElement("audio");
                audioElement.srcObject = userStream;
                audioElement.autoplay = true;
                document.body.appendChild(audioElement);
                setRemoteStream(userStream);
            });
            
            peer.signal(callerSignal);
            connectionRef.current = peer;
            setCallStatus("Connecting...");
        } catch (error) {
            console.error("Microphone access error:", error);
        }
    };
    const leaveCall = () => {
        if (connectionRef.current) {
            connectionRef.current.destroy();
            connectionRef.current = null;
        }
        stopRingtone();
        stopCallTimer();
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    
        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => track.stop());
            setRemoteStream(null);
        }
    
        document.querySelectorAll("audio").forEach((audio) => {
            audio.pause();
            audio.srcObject = null;
            audio.remove();
        });
    
        if (caller || calling) {
            socket.emit("endCall", { from: user?.identity?.address, to: caller.from});
        }
    
        setReceivingCall(false);
        setCallAccepted(false);
        setCalling(false);
        setCallStartTime(null);
        setCaller(null);
        setCallerSignal(null);
        setShowIncomingCallModal(false);
        setShowOngoingCallModal(false);
        setCallStatus("Calling");
        socket.off("callAccepted");
        // socket.off("callUser");
        socket.off("answerCall");
        socket.off("startTime");
        socket.off("walletCreated");
        socket.off("callEndedNow");
        socket.off("callRejected");
        socket.off("endCall");
        attachCallListeners();
    };
    const attachCallListeners = () => {
        socket.on("contactRequestReceived", (contact) => {
            dispatch(getContacts());
          });
        socket.on("incomingCall", ({ signal, from, details }) => {
            stopCallTimer();
            if (callAccepted) {
                socket.emit("userBusy", { to: from });
                return;
            }
            playRingtone();
            setReceivingCall(true);
            setCaller({ ...details, from });
            setCallerSignal(signal);
            setShowIncomingCallModal(true);
        });
    
        socket.on("startTime", ({ startTime }) => {
            setCallStatus("In Progress");
            setCallStartTime(startTime);
            startCallTimer(startTime);
        });
    
        socket.on("walletCreated", ({ wallet }) => {
            dispatch(walletSuccess(wallet));
        });
    
        socket.on("callEndedNow", leaveCall);
        socket.on("callRejected", leaveCall);
        
    };
    
    return (
        <CallContext.Provider
            value={{
                receivingCall,
                caller,
                callerSignal,
                callAccepted,
                callStartTime,
                callDuration,
                showIncomingCallModal,
                showOngoingCallModal,
                calling,
                stream,
                remoteStream,
                answerCall,
                // callUser,
                leaveCall
            }}
        >
            {children}

            {/* Incoming Call Modal */}
            <Modal isOpen={showIncomingCallModal} className="modal-dialog-centered modal-sm">
                <div className="bg-modal">
                    <ModalBody className="custom-modal-body text-center">
                        <h2 className="msg-heading">Incoming Call</h2>
                        {caller && (
                            <>
                                <img
                                    src={caller.avatar || "/default-avatar.png"}
                                    className="rounded-circle"
                                    style={{ height: '130px', width: '130px', objectFit: 'cover' }}
                                    alt={caller.name || "Caller Avatar"}
                                />
                                <p>{caller.name || "Unknown Caller"}</p>
                            </>
                        )}
                        <span className="p-2 mx-2 rounded-circle bg-success text-white" role="button" onClick={answerCall}>
                            <i className="mdi mdi-phone"></i>
                        </span>
                        <span className="p-2 rounded-circle bg-danger text-white" role="button" onClick={leaveCall}>
                            <i className="mdi mdi-phone"></i>
                        </span>
                    </ModalBody>
                </div>
            </Modal>

            {/* Ongoing Call Modal */}
            <Modal isOpen={showOngoingCallModal} className="modal-dialog-centered modal-sm">
                <ModalBody className="custom-modal-body text-center">
                    <h2 className="msg-heading">Calling</h2>
                     <img 
                        src={caller ? caller.avatar : selectedUser?.identity?.avatar} 
                        className="rounded-circle" 
                        style={{ height: '130px', width: '130px', objectFit: 'cover' }} 
                        alt="Caller Avatar" 
                    />
                    {caller && <p>{caller.name}</p>}
                    {callStatus && <p>{callStatus}</p>}
                    <p>Duration: {callDuration}</p>
                    <span className="p-2 rounded-circle bg-danger text-white" role="button" onClick={leaveCall}>
                        <i className="mdi mdi-phone"></i>
                    </span>
                </ModalBody>
            </Modal>
        </CallContext.Provider>
    );
};

export default CallProvider;
