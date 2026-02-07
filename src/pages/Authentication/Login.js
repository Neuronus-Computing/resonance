import React, { Component } from "react";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import Logo from "../../components/Auth/Logo";
import AuthFooter from "../../components/Auth/AuthFooter";
import AuthIcon from "../../components/Auth/AuthIcon";
import { toast } from "react-toastify";
import { login,getWordPool } from '../../store/actions';
import { AvForm } from "availity-reactstrap-validation";
import withRouter from "../../components/Common/withRouter";
import axios from "../../util/axiosConfig";
import InputTag from "../../components/Common/InputTag";
class Login extends Component {
  constructor(props) {
    super(props);
    this.seedInputRef = React.createRef();
    this.state = {
      seed: "",
      loading: false,
      registrationError: null,
      wordPool: props.wordPool || [],
      suggestions: [],
      seedTags: [],
      error:null
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSeedChange = this.handleSeedChange.bind(this);
    this.handleSuggestionClick = this.handleSuggestionClick.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ loading: true, registrationError: null });
    if (this.state.seedTags.length !== 16) {
      this.setState({ loading: false });
      toast.error("You must enter exactly 16 words.");
      return;
    }
    const {login} = this.props;
    const seedString = this.state.seedTags.map((tag) => tag.text).join(" ");
    login({ seed: seedString }, () => this.props.router.navigate("/important-note"));
    this.setState({ loading: false, registrationError: null });
  }

  handleSeedChange(event) {
    const seed = event.target.value.toUpperCase();
    this.setState({ seed });
    const lastSegment = seed.split(" ").pop();
    this.filterWordSuggestions(lastSegment);
  }

  handleSuggestionClick(suggestion) {
    const { seed } = this.state;
    const segments = seed.split(" ");
    segments[segments.length - 1] = suggestion;
    const newSeed = segments.join(" ");
    this.setState({ seed: newSeed, suggestions: [] });
  }
  handleError = (errorMessage) => {
    this.setState({ error: errorMessage });
  };

  async componentDidMount() {
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
  }
  componentDidUpdate(prevProps) {
    if (prevProps.wordPool !== this.props.wordPool) {
      this.setState({ wordPool: this.props.wordPool });
    }
  }

  componentWillUnmount() {
    document.body.classList.remove("auth-body-bg");
  }

  filterWordSuggestions(query) {
    if (query.length > 0) {
      const suggestions = this.state.wordPool.filter(word => word.toUpperCase().startsWith(query.toUpperCase()))
        .slice(0, 10);
      this.setState({ suggestions });
    } else {
      this.setState({ suggestions: [] });
    }
  }

  handleDelete(i) {
    this.setState((state) => {
      const newSeedTags = state.seedTags.filter((tag, index) => index !== i);
      const seedString = newSeedTags.map(tag => tag.text).join(" ");
      return {
        seedTags: newSeedTags,
        seed: seedString,
      };
    });
  }

  handleAddition(tag) {
    this.setState((state) => {
      const newSeedTags = [...state.seedTags, tag];
      const seedString = newSeedTags.map(tag => tag.text).join(" ");
      return {
        seedTags: newSeedTags,
        seed: seedString,
        suggestions: [],
      };
    });
  }
  render() {
    const { seedTags, error,wordPool } = this.state;
    const isSubmitDisabled = seedTags.length !== 16;
    return (
      <React.Fragment>
        <div>
          <div className="container-fluid p-0">
            <div className="row g-0">
              <div className="left-page">
                <div className="bg-img">
                  <Logo />
                </div>
              </div>

              <div className="login-cls text-center">
                <div className="login-content">
                  <AuthIcon />
                  <h1>Log In</h1>
                  <div className="txt-cls">
                    <label htmlFor="seed" className="label-cls mt-3">Key Seed</label>
                    <AvForm className="form-horizontal" onValidSubmit={this.handleSubmit}>
                    <InputTag
                        seedTags={seedTags}
                        suggestions={wordPool.map((word) => ({ id: word, text: word }))}
                        handleDelete={this.handleDelete}
                        handleAddition={this.handleAddition}
                      />
                      {error && <div className="error-message">{error}</div>}
                      <div className="form-group">
                        <Button
                          color="primary"
                          className="w-md w-100 login-btn cryto-btn"
                          type="submit"
                          disabled={this.state.loading || isSubmitDisabled}
                        >
                          {this.state.loading ? "Loading ..." : "Next"}
                        </Button>
                      </div>
                    </AvForm>

                    <AuthFooter
                      link="/register"
                      linkText="Register"
                      text="Don't have an account?"
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
  login: (seed, callback) => dispatch(login(seed, callback)),
   getWordPool: () => dispatch(getWordPool()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
