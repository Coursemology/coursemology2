import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.element.isRequired,
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <h1>Something went wrong.</h1>
          <p>{this.state.error.toString()}</p>
          <p>{this.state.info.componentStack}</p>
        </>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = propTypes;

export default ErrorBoundary;
