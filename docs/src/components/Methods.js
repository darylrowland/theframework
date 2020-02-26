import React, { Component } from 'react';
import Radium from 'radium';

import Method from "./Method";

class Methods extends Component {
	render() {
		if (!this.props.methods) {
			return null;
		}

		return (
			<div>
				{this.props.methods.map((method) => {
					return (
						<Method
							key={`${method.method}${method.url}`}
							method={method}
							onClick={() => this.props.onShowMethod(method)}
						/>
					)
				})}
			</div>
		)
	}
}

// const localStyles = {

// };

export default Radium(Methods);