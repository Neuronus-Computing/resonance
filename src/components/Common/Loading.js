import React from "react";
import Lottie from 'react-lottie';
import animationData from '../../assets/loading/Animation.json'; 

const Loading = ({ height = 150, width = 150 }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="main-loading-cls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex:"1000000 !important"}}>
      <Lottie options={defaultOptions} height={height} width={width} />
    </div>
  );
};

export default Loading;
