import { useState } from 'react';
import { Card, CardContent, Tab, Tabs } from '@mui/material';
import { grey } from '@mui/material/colors';
import { List } from 'immutable';
import PropTypes from 'prop-types';

const propTypes = {
  templates: PropTypes.instanceOf(List).isRequired,
};

const UploadedPackageTemplateView = (props) => {
  const [tabValue, setTabValue] = useState(0);

  const templateTabs = props.templates.map((template, index) => {
    const id = `tab_header_${template.get('id')}`;
    const name = template.get('filename');
    return (
      <Tab
        key={id}
        className="template-tab"
        label={name}
        style={{ textTransform: 'none', color: 'black' }}
        value={index}
      />
    );
  });

  const templateTabContents = props.templates.map((template, index) => {
    const id = `tab_content_${template.get('id')}`;
    return (
      <div
        key={id}
        className="template-content"
        dangerouslySetInnerHTML={{ __html: template.get('content') }}
        style={{ ...(index === tabValue ? {} : { display: 'none' }) }}
      />
    );
  });

  return (
    <Card>
      <Tabs
        onChange={(event, value) => {
          setTabValue(value);
        }}
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: grey[300],
        }}
        TabIndicatorProps={{ color: 'primary', style: { height: 3 } }}
        value={tabValue}
        variant="fullWidth"
      >
        {templateTabs}
      </Tabs>
      <CardContent style={{ paddingBottom: 0 }}>
        {templateTabContents}
      </CardContent>
    </Card>
  );
};

UploadedPackageTemplateView.propTypes = propTypes;

export default UploadedPackageTemplateView;
