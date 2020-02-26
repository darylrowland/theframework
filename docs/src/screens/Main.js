import React, { Component } from 'react';
import Radium from 'radium';

import Methods from '../components/Methods';
import Style from '../Style';

class Main extends Component {

	render() {
		return (
			<div style={Style.global.mainContainer}>
				<div style={Style.global.mainInnerContainer}>
					<h1>API Docs</h1>
					<Methods
						methods={this.props.methods}
					/>
				</div>
			</div>
			
		)
	}
}

export default Radium(Main);