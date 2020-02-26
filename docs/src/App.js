import React, { Component } from 'react';
import Radium from 'radium';
import Main from "./screens/Main";

import { BrowserRouter as Router,
	Switch,
	Route} from "react-router-dom";

import HttpServices from "./services/HttpServices";
import ViewMethod from './screens/ViewMethod';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			methods: null
		};
	}

	componentDidMount() {
		this.reload();
	}

	async reload() {
		const docsJson = await HttpServices.get("/docs.json");

		this.setState({
			loading: false,
			docsJson: docsJson,
			methods: docsJson.method
		});
	}

	render() {
		
		return (
			<Router>
				<div>
					<Switch>
						<Route path="/docs/methods">
							<ViewMethod
								loading={this.state.loading}
								methods={this.state.methods}
							/>
						</Route>
						<Route path="/">
							<Main
								methods={this.state.methods}
							/>
						</Route>
					</Switch>
				</div>
			</Router>
		);
		 
	}
}

export default Radium(App);