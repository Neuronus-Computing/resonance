import React from "react";
// import { Link } from "react-router-dom";
// import defaultSrc from "../../assets/images/auth/icon.svg";
import { ReactComponent as AuthIconComponent } from "../../assets/images/auth/icon.svg";

const AuthIcon = ({ src = "" }) => {
  return (
    <div className='col-lg-12'>
      <AuthIconComponent className="main-logo-cls" style={{ color: 'var(--skyblueText) !important'}}/> 

        {/* <img className="logo-icon pb-4" src={src} alt="logo" /> */}
    </div>
  );
};

export default AuthIcon;
