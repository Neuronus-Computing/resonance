import React, { Component } from "react";
import { Button } from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import Logo from "../../components/Auth/Logo";
import AuthFooter from "../../components/Auth/AuthFooter";
import AuthIcon from "../../components/Auth/AuthIcon";
import withRouter from "../../components/Common/withRouter";
import axios from '../../util/axiosConfig'; 
import { toast } from "react-toastify";
import copyIcon from "../../assets/images/auth/copy_icon.png";
import saveIcon from "../../assets/images/auth/save_icon.png";
import InputTag from "../../components/Common/InputTag";
import { connect } from "react-redux";
import { getWordPool } from '../../store/actions';
import { getColoredSvgBg } from "../../util/authBackLogo";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seed: "",
      loading: false,
      registrationError: null,
      isSeedEmpty: true,
      seedTags: [],
      wordPool: props.wordPool || [],
      logoCircleColor: "#1877F2",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }
  async fetchSeedFromApi() {
    try {
      const response = await axios.get('/user/register');
      if (response.status !== 200) {
        toast.error("Failed to generate seed.");
        return;
      }
      const seed = response.data.seed;
      const seedTags = seed.split(' ').map(word => ({ id: word, text: word }));
      
      this.setState({ 
        seed,
        seedTags,
        isSeedEmpty: false
      });
    } catch (error) {
      toast.error("Failed to generate seed.");
    }
  }
  
  async handleSubmit(event, values) {
    this.setState({ loading: true });
    try {
      const response = await axios.post("/user/register", { seed: this.state.seed }); 
      if (response.status === 200) {
        toast.success(response.data.message);
        this.props.router.navigate('/login');
      } else {
        toast.error("Failed to register seed.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Error registering seed.");
      }
    } finally {
      this.setState({ loading: false });
    }
  }  
  async componentDidMount() {
    this.fetchSeedFromApi();
    document.body.classList.add("auth-body-bg");
    try {
      const response = await axios.get("/user/get-word-pool");
      if (response.status === 200) {
        this.setState({ wordPool: response.data });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to fetch word pool.";
      toast.error(errorMessage);
    }
    // Allow DOM to apply theme before accessing CSS variables
    setTimeout(() => {
      const currentTheme = document.body.getAttribute("data-bs-theme") || "light";

      // Important: use document.body because theme is set on body
      const logoCircleColor = getComputedStyle(document.body)
        .getPropertyValue("--mainLogoLeftSide")
        .trim();

      if (logoCircleColor) {
        this.setState({ logoCircleColor });
      }
    }, 0);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.wordPool !== this.props.wordPool) {
      this.setState({ wordPool: this.props.wordPool });
    }
  }

  handleCopy() {
    navigator.clipboard.writeText(this.state.seed);
    toast.success("Seed copied to clipboard.");
  }
  handleSave() {
    const element = document.createElement("a");
    const file = new Blob([this.state.seed], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "seed.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Seed downloaded successfully.");
  }

  render() {
    const { seedTags,wordPool } = this.state;
    const { logoCircleColor } = this.state;
    
    const bgStyle = {
      backgroundImage: `url("${getColoredSvgBg(logoCircleColor)}")`,
    };
    return (
      <React.Fragment>
        <div>
          <div className="container-fluid p-0">
            <div className="row g-0">
              <div className="left-page">
                {/* style={bgStyle} */}
                <div className="bg-img">
                  <Logo />
                </div>
              </div>
              <div className="login-cls text-center">
                <div className="login-content">
                  <AuthIcon />
                  <h1 className="">Your Seed</h1>
                  <div className="txt-cls main-top-reg">
                    <AvForm
                      onValidSubmit={this.handleSubmit}
                      className="form-horizontal"
                    >
                      <div className="seed-detials">
                        <InputTag
                        seedTags={seedTags}
                        suggestions={wordPool.map((word) => ({ id: word, text: word }))}
                        handleDelete={null}
                        handleAddition={null}
                        disabled={true}
                      />
                        <div className="icons">
                          <Button color="" className="icon-btns" alt="neuroicons" onClick={this.handleSave}>
                            <span>
                              <img src={saveIcon} alt="save"/>
                              <span className="text">Save</span>
                            </span>
                          </Button>
                          <Button color="" className="icon-btns" alt="neuroicons" onClick={this.handleCopy} >
                            <span>
                              <img src={copyIcon} alt="copy"/>
                              <span className="text">Copy</span>
                            </span>
                          </Button>
                        </div>
                      </div>
                      {this.state.isSeedEmpty && (
                        <div>
                          <p className="inner-txt-cls">
                            Please write these down in case you lose your seed.
                          </p>
                        </div>
                      )}
                      <div className="form-group">
                        <Button
                          color="primary"
                          className="w-md w-100 cryto-btn login-btn mt-5"
                          type="submit"
                          disabled={this.state.loading}
                        >
                          {this.state.loading ? "Loading ..." : "I have saved my seeds!"}
                        </Button>
                        {this.state.registrationError && (
                          <p className="text-danger">
                            {this.state.registrationError}
                          </p>
                        )}
                      </div>
                    </AvForm>
                    <AuthFooter
                      link="/login"
                      linkText="Login"
                      text="Do you have an account?"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  wordPool: state.User.wordPool || [], 
});

const mapDispatchToProps = (dispatch) => ({
   getWordPool: () => dispatch(getWordPool()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Register));

