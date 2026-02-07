import React, { Component } from "react";

import { Container } from "reactstrap";

import { Link } from "react-router-dom";
import { getColoredSvgBg } from "../../util/authBackLogo";

import Logo from "../../components/Auth/Logo";
import AuthFooter from "../../components/Auth/AuthFooter";
import AuthIcon from "../../components/Auth/AuthIcon";

class Note extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logoCircleColor: "#1877F2",
    };
  }

  componentDidMount() {
    // Allow DOM to apply theme before accessing CSS variables
    setTimeout(() => {
      const currentTheme = document.body.getAttribute("data-bs-theme") || "light";

      // Important: use document.body because theme is set on body
      const logoCircleColor = getComputedStyle(document.body)
        .getPropertyValue("--mainLogoLeftSide")
        .trim();

      // console.log("✅ Theme:", currentTheme);
      // console.log("✅ Resolved --mainLogoLeftSide:", logoCircleColor);
      
      if (logoCircleColor) {
        this.setState({ logoCircleColor });
      }
    }, 0);
  }

  render() {
    const { logoCircleColor } = this.state;

    const bgStyle = {
      backgroundImage: `url("${getColoredSvgBg(logoCircleColor)}")`,
    };

    return (
      <React.Fragment>
        <div>
          <Container fluid className=" p-0">
            <div className="row g-0">
              <div className="left-page">
                {/* style={bgStyle} */}
                <div className="bg-img">
                  <Logo />
                </div>
              </div>
              <div className="login-cls text-center">
                      <div className=" login-content">
                        <AuthIcon />
                        <h1 className="">Important Note</h1>
                        <div className="text-center">
                         
                          <p>
                          On the next page you will see a series of 16 words. This is your unique and private seed and it is the ONLY way to recover your wallet in case of loss or manifestation. It is your responsibility to write it down and store it in a safe place outside of the Resonance System.
                          </p>
                          <Link
                            to="/register"
                          >
                          <button color="primary"
                            className="w-md w-100 btn cryto-btn login-btn">
                            I understand, show me my seed
                          </button>
                          </Link>
                        </div>
                        <AuthFooter
                          link="/login"
                          linkText="Login"
                          text="Do you have account?"
                        />
                      </div>
              </div>
            </div>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

export default Note;
