import React, { Component } from 'react';
import Radium from 'radium';

import Style from "../Style";
import MethodAndUrlTitle from '../components/MethodAndUrlTitle';
import Parameters from '../components/Parameters';

class ViewMethod extends Component {

	constructor(props){
		super(props);

		var params = (new URL(document.location)).searchParams;
		var method = params.get("method");
		var url = params.get("url");

		this.state = {
			url: {
				method: method,
				url: url
			}
		};
	}

	getMethod() {
		for (const method of this.props.methods) {
			if (method.method === this.state.url.method && method.url === this.state.url.url) {
				return method;
			}
		}

		return null;
	}

	render() {
		if (this.props.loading) {
			return null;
		}

		const method = this.getMethod();

		return (
			<div style={Style.global.mainContainer}>
				<div style={Style.global.mainInnerContainer}>
					<MethodAndUrlTitle
						method={method}
					/>
					<div>{method.description}</div>

					<div style={localStyles.parameters}>
						<h3>Parameters</h3>
						<Parameters
							parameters={method.parameters}
						/>
					</div>
					

				</div>
			</div>
		)
	}
}

const localStyles = {
	parameters: {
		marginTop: 30
	}
};

export default Radium(ViewMethod);