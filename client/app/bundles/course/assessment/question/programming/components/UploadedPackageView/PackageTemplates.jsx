import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'material-ui/Card';
import { Tabs, Tab } from 'material-ui/Tabs';
import { cyan500, grey300 } from 'material-ui/styles/colors';

const propTypes = {
  templates: PropTypes.array.isRequired,
};

const PackageTemplates = (props) => {
  const templateTabs = props.templates.map((template) => {
    const { id, name, content } = template;

    return (
      <Tab
        className="template-tab"
        label={name}
        value={id}
        key={id}
        style={{ textTransform: 'none', color: 'black' }}
      >
        <div
          className="template-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Tab>
    );
  });

  return (
    <Card>
      <Tabs
        contentContainerStyle={{ padding: '0.5em' }}
        tabItemContainerStyle={{
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: grey300,
        }}
        inkBarStyle={{ backgroundColor: cyan500 }}
      >
        {templateTabs}
      </Tabs>
    </Card>
  );
};

PackageTemplates.propTypes = propTypes;

export default PackageTemplates;
