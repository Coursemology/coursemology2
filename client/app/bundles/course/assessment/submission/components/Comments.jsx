import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
  comments: {
    marginTop: 30,
  },
};

export default class Comments extends Component {
  render() {
    return (
      <div style={styles.comments}>
        <TextField
          floatingLabelText={<h4>Comments</h4>}
          fullWidth
          multiLine
          rows={2}
          rowsMax={4}
        />
        <RaisedButton
          primary
          label="Comment"
          onTouchTap={() => {}}
        />
      </div>
    );
  }
}
