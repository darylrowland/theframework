import React, { Component } from 'react';
import Radium from 'radium';

import {
	Link
  } from "react-router-dom";

import MethodAndUrlTitle from './MethodAndUrlTitle';

class Method extends Component {
	render() {
		var authRequired = "";

		if (this.props.method.authRequired) {
			authRequired = "🔑 "
		}

		return (
			<Link to={`/docs/methods?method=${this.props.method.method}&url=${this.props.method.url}`}>
				<div style={localStyles.container}>
					<MethodAndUrlTitle
						method={this.props.method}
					/>
					<div>
						{authRequired}
						{this.props.method.description}
					</div>
				</div>
			</Link>
		)
	}
}

const localStyles = {
	container: {
		marginBottom: 30,
		cursor: "pointer"
	}
};

export default Radium(Method);