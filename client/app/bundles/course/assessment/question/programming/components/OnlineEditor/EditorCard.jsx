import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import AceEditor from 'lib/components/redux-form/AceEditor';
import { Field } from 'redux-form';

class EditorCard extends React.Component {
  static propTypes = {
    mode: PropTypes.string.isRequired,
    field: PropTypes.string,
    header: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
  }

  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  render() {
    const { mode, field, header, subtitle, isLoading } = this.props;
    return (
      <Card containerStyle={{ paddingBottom: 0 }} initiallyExpanded>
        <CardHeader
          title={header}
          textStyle={{ fontWeight: 'bold' }}
          subtitle={subtitle}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable style={{ padding: 0 }}>
          <Field
            component={AceEditor}
            name={EditorCard.getInputName(field)}
            filename={field}
            mode={mode}
            theme="monokai"
            width="100%"
            minLines={10}
            maxLines={20}
            editorProps={{ $blockScrolling: true }}
            setOptions={{ useSoftTabs: true, readOnly: isLoading }}
          />
        </CardText>
      </Card>
    );
  }
}

export default EditorCard;
