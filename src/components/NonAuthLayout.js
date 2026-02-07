import React, { Component } from 'react';
import { Navigate } from "react-router-dom";
import withRouter from './Common/withRouter';

class NonAuthLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.capitalizeFirstLetter.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setDocumentTitle();
        }
    }
    capitalizeFirstLetter = string => {
        return string.charAt(1).toUpperCase() + string.slice(2);
    };

    componentDidMount() {
        const bsTheme = localStorage.getItem('theme') || 'light';

        // Apply theme settings to <body> element
        const body = document.body;
        body.setAttribute('data-topbar', bsTheme);
        body.setAttribute('data-bs-theme', bsTheme);

        let currentpage = this.capitalizeFirstLetter(this.props.router.location.pathname);
        currentpage = currentpage.replaceAll("-", " ");
        document.title = `${currentpage} | Resonance`;
    }
    setDocumentTitle() {
      const { router } = this.props;
      const path = router.location.pathname;
      let pathSegments = path.split('/').filter(segment => segment);
      pathSegments = pathSegments.map(segment => {
        return segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
      let currentPage = pathSegments.join(' - ');
      document.title = `${currentPage} | Resonance`;
    }    
    render() {
        const { router } = this.props;
        const path = router.location.pathname;
        if (localStorage.getItem("authToken")) {
            if (
                !path.startsWith("/channel/") &&
                !path.startsWith("/channel-preview/")
            ) {
                return <Navigate to={{ pathname: "/messages", state: { from: this.props.location } }} />;
            }
        }
        return <React.Fragment>
            {this.props.children}
        </React.Fragment>;
    }
}

export default withRouter(NonAuthLayout);
