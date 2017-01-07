import Immutable from 'immutable';

import React, { PropTypes } from 'react';

const propTypes = {
  selectedTab: PropTypes.number,
  changeTemplateTab: PropTypes.func.isRequired,
  templates: PropTypes.instanceOf(Immutable.List).isRequired,
};

class TemplatePackageView extends React.Component {

  onTemplateTabClick(selected) {
    return (e) => {
      e.preventDefault();
      this.props.changeTemplateTab(selected);
    };
  }

  render() {
    const templates = this.props.templates;
    let selectedTab = this.props.selectedTab;
    let selectedTemplate = null;

    if (selectedTab === null && templates.size > 0) {
      selectedTab = templates.get(0).get('id');
    }

    const templateTabs = templates.map((template) => {
      const id = template.get('id');
      const name = template.get('filename');
      const active = id === selectedTab;

      if (active) {
        selectedTemplate = template.get('content');
      }

      return (
        <li className={active ? 'active' : null} role="presentation" key={id}>
          <a href={`#template_${id}`} onClick={this.onTemplateTabClick(id)}>{name}</a>
        </li>
      );
    });

    return (
      <div className="templates" role="tabpanel">
        <ul className="nav nav-tabs" role="tablist">
          {templateTabs}
        </ul>
        <div className="template-content" dangerouslySetInnerHTML={{ __html: selectedTemplate }} />
      </div>
    );
  }
}

TemplatePackageView.propTypes = propTypes;

export default TemplatePackageView;
