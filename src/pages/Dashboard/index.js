import React, { Component } from "react";
import { Container } from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            breadcrumbItems : [
                { title : "Dashboard", link : "#" },
            ],
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>

                    <Breadcrumbs title="Dashboard" breadcrumbItems={this.state.breadcrumbItems} />
                       
                    </Container> 
                </div>
            </React.Fragment>
        );
    }
}

export default Dashboard;
