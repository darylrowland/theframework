import React, { Component } from 'react';
import Radium from 'radium';

import Parameter from "./Parameter";

class Parameters extends Component {
	render() {
		if (!this.props.parameters) {
			return null;
		}

		return (
			<table style={localStyles.table}>
				<tbody>
				{this.props.parameters.map((param) => {
					return (
						<Parameter
							key={param.id}
							parameter={param}
						/>
					);
				})}
				</tbody>
			</table>
		);
	}
}

const localStyles = {
	table: {
		borderSpacing: "0px 15px"
	}
};

export default Radium(Parameters);