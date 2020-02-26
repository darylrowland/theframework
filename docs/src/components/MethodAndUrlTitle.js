import React, { Component } from 'react';
import Radium from 'radium';

import Style from "../Style";

class MethodAndUrlTitle extends Component {
	render() {
		return (
			<div style={localStyles.methodRow}>
				<div style={[Style.global.methodIndicator, Style.global.methodIndicatorMethods[this.props.method.method]]}>{this.props.method.method}</div>
				<h2>{this.props.method.url}</h2>
			</div>
		);
	}
}

const localStyles = {
	methodRow: {
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
	}
};

export default Radium(MethodAndUrlTitle);