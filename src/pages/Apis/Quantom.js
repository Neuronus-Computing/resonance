import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import apis from './quantom.json';
import logo from "../../assets/images/resonance.svg";

const apiBaseUrl = `${process.env.REACT_APP_API_QUANTOM_BASE_URL}`
const apiSpec = {
  ...apis,
  servers: [
    {
      url:apiBaseUrl,
    },
    
  ],
};
const SwaggerUIComponent = () => {
  return (
    <React.Fragment>
      <div className="container">
        <div className='text-center'>
          <img src={logo} alt="resonance" style={{ height: '100px', width: '100px' }} />
        </div>
        <SwaggerUI spec={apiSpec} />
      </div>
    </React.Fragment>
  );
};

export default SwaggerUIComponent;
