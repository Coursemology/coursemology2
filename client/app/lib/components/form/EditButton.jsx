import React, { PropTypes } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

const EditButton = ({ path }) =>
  <Button href={path} bsSize="small">
    <Glyphicon glyph="edit" />
  </Button>;

EditButton.propTypes = {
  path: PropTypes.string.isRequired,
};

export default EditButton;
