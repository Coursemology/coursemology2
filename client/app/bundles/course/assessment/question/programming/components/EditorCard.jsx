import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import AceEditor from 'react-ace';

class EditorCard extends React.Component {
  static propTypes = {
    updateCodeBlock: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    field: PropTypes.string,
    value: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
  }

  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  codeChangeHandler(field) {
    return e => this.props.updateCodeBlock(field, e);
  }

  render() {
    const { mode, field, value, header, subtitle, isLoading } = this.props;
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
          <textarea
            name={EditorCard.getInputName(field)}
            value={value}
            style={{ display: 'none' }}
            readOnly="true"
          />
          <AceEditor
            mode={mode}
            theme="monokai"
            width="100%"
            minLines={10}
            maxLines={Math.max(20, value.split(/\r\n|\r|\n/).length)}
            name={EditorCard.getInputName(field)}
            value={value}
            onChange={this.codeChangeHandler(field)}
            editorProps={{ $blockScrolling: true }}
            setOptions={{ useSoftTabs: true, readOnly: isLoading }}
          />
        </CardText>
      </Card>
    );
  }

}

export default injectIntl(EditorCard);
