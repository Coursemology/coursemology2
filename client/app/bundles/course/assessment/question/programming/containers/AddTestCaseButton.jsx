import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import FlatButton from 'material-ui/FlatButton';
import { formNames } from '../constants';

const selector = formValueSelector(formNames.PROGRAMMING_QUESTION);

const MAX_TEST_CASES = 99;

const AddTestCaseButton = props => (
  <FlatButton
    icon={<i className="fa fa-plus" />}
    // disabled={this.props.isLoading || numAllTestCases >= MAX_TEST_CASES}
    {...props}
  />
);

AddTestCaseButton.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  const publicTestCases = selector(state, 'question_programming[test_cases][public]');
  const privateTestCases = selector(state, 'question_programming[test_cases][private]');
  const evaluationTestCases = selector(state, 'question_programming[test_cases][evaluation]');

  return {
    disabled: publicTestCases.length + privateTestCases.length + evaluationTestCases.length >= MAX_TEST_CASES,
  };
}

export default connect(mapStateToProps)(AddTestCaseButton);
