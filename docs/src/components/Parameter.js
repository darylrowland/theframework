import React, { Component } from 'react';
import Radium from 'radium';
import Style from '../Style';


class Parameter extends Component {

	renderRequired() {
		if (!this.props.parameter.required) {
			return <div></div>;
		}

		return (
			<div style={Style.global.requiredIndicator}>
				*
			</div>
		);
	}

	render() {
		return (
			
				<tr style={localStyles.titleRow}>
					<td>
						<div style={Style.global.typeIndicator}>
							String
						</div>
					</td>
					<td>
						{this.renderRequired()}
					</td>
					
					<td>
						<div style={localStyles.id}>
							{this.props.parameter.id}
						</div>
					</td>

					<td style={localStyles.descriptionCell}>
						<div style={localStyles.description}>
							{this.props.parameter.description}
						</div>
					</td>
					
				</tr>
				
				
		);
	}
}

const localStyles = {
	titleRow: {
		paddingBottom: 10
	},
	id: {
		fontWeight: "700",
		fontSize: 15
	},
	description: {
		fontSize: 15,
		opacity: 0.5
	},
	descriptionCell: {
		paddingLeft: 20
	}
};

export default Radium(Parameter);