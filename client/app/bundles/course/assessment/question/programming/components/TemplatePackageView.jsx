import React, { PropTypes } from 'react';

export default class TemplatePackageView extends React.Component {
  static propTypes = {
    changeTemplateTab: PropTypes.func.isRequired,
    templates: PropTypes.object.isRequired
  };

  onTemplateTabClick(selected, e) {
    e.preventDefault();
    this.props.changeTemplateTab(selected);
  }

  render() {
    const templates = this.props.templates;
    var selectedTab = this.props.selectedTab;
    var selectedTemplate = null;

    if (selectedTab == null && templates.size > 0) {
      selectedTab = templates.get(0).get('id');
    }

    const templateTabs = templates.map(template => {
      let id = template.get('id');
      let name = template.get('filename');
      let active = id == selectedTab;

      if (active) {
        selectedTemplate = template.get('content');
      }

      return (
        <li className={ active ? 'active' : null } role="presentation" key={id}>
          <a href="#" onClick={this.onTemplateTabClick.bind(this, id)}>{name}</a>
        </li>
      );
    });

    return (
      <div className="templates" role="tabpanel">
        <ul className="nav nav-tabs" role="tablist">
          {templateTabs}
        </ul>
        <div className="template-content" dangerouslySetInnerHTML={{__html: selectedTemplate}}/>
      </div>
    );
  }
}
