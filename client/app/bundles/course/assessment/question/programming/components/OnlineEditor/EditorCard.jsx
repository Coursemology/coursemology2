import { Component } from 'react';
import AceEditor from 'react-ace';
import { injectIntl } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import PropTypes from 'prop-types';

class EditorCard extends Component {
  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  codeChangeHandler(field) {
    return (e) => this.props.updateCodeBlock(field, e);
  }

  render() {
    const { mode, field, value, header, subtitle, isLoading } = this.props;
    return (
      <Card containerStyle={{ paddingBottom: 0 }} initiallyExpanded={true}>
        <CardHeader
          actAsExpander={true}
          showExpandableButton={true}
          subtitle={subtitle}
          textStyle={{ fontWeight: 'bold' }}
          title={header}
        />
        <CardText expandable={true} style={{ padding: 0 }}>
          <textarea
            name={EditorCard.getInputName(field)}
            readOnly="true"
            style={{ display: 'none' }}
            value={value}
          />
          <AceEditor
            editorProps={{ $blockScrolling: true }}
            maxLines={Math.max(20, value.split(/\r\n|\r|\n/).length)}
            minLines={10}
            mode={mode}
            name={EditorCard.getInputName(field)}
            onChange={this.codeChangeHandler(field)}
            setOptions={{ useSoftTabs: true, readOnly: isLoading }}
            theme="monokai"
            value={value}
            width="100%"
          />
        </CardText>
      </Card>
    );
  }
}

EditorCard.propTypes = {
  updateCodeBlock: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  field: PropTypes.string,
  value: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
};

export default injectIntl(EditorCard);
