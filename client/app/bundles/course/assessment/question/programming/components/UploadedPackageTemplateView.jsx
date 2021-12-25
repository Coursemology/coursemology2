import Immutable from 'immutable';
import { Card } from 'material-ui/Card';
import { cyan500, grey300 } from 'material-ui/styles/colors';
import { Tab, Tabs } from 'material-ui/Tabs';
import PropTypes from 'prop-types';

const propTypes = {
  templates: PropTypes.instanceOf(Immutable.List).isRequired,
};

const UploadedPackageTemplateView = (props) => {
  const templateTabs = props.templates.map((template) => {
    const id = template.get('id');
    const name = template.get('filename');

    return (
      <Tab
        key={id}
        className="template-tab"
        label={name}
        style={{ textTransform: 'none', color: 'black' }}
        value={id}
      >
        <div
          className="template-content"
          dangerouslySetInnerHTML={{ __html: template.get('content') }}
        />
      </Tab>
    );
  });

  return (
    <Card>
      <Tabs
        contentContainerStyle={{ padding: '0.5em' }}
        inkBarStyle={{ backgroundColor: cyan500 }}
        tabItemContainerStyle={{
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: grey300,
        }}
      >
        {templateTabs}
      </Tabs>
    </Card>
  );
};

UploadedPackageTemplateView.propTypes = propTypes;

export default UploadedPackageTemplateView;
