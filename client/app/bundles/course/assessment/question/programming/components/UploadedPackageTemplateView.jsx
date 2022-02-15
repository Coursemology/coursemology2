import Immutable from 'immutable';

import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from '@material-ui/core';
import { cyan, grey } from '@material-ui/core/colors';

const propTypes = {
  templates: PropTypes.instanceOf(Immutable.List).isRequired,
};

const UploadedPackageTemplateView = (props) => {
  const templateTabs = props.templates.map((template) => {
    const id = template.get('id');
    const name = template.get('filename');

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
          dangerouslySetInnerHTML={{ __html: template.get('content') }}
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
          borderColor: grey[300],
        }}
        inkBarStyle={{ backgroundColor: cyan[500] }}
      >
        {templateTabs}
      </Tabs>
    </Card>
  );
};

UploadedPackageTemplateView.propTypes = propTypes;

export default UploadedPackageTemplateView;
