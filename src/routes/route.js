import { checkAuth } from "../store/actions";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import Lottie from 'react-lottie';
import animationData from '../assets/loading/Animation.json';

const AppRoute = (props) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.User);
  const dispatch = useDispatch();
  const [delayFinished, setDelayFinished] = useState(false);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayFinished(true);
    }, 1000); 
    return () => clearTimeout(timer);
  }, []);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  if (isLoading || !delayFinished) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Lottie options={defaultOptions} height={150} width={150} />
      </div>
    );
  }

  if (!isAuthenticated && !localStorage.getItem("authToken")) {
    return (
      <Navigate to={{ pathname: "/important-note", state: { from: props.location } }} />
    );
  }

  return <React.Fragment>{props.children}</React.Fragment>;
};
export default AppRoute;
