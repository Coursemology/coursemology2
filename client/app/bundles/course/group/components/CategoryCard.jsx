import { Card, CardHeader, CardText, Divider } from 'material-ui';
import React from 'react';
import PropTypes from 'prop-types';

import { categoryShape, courseUserShape } from '../propTypes';
import GroupCard from './GroupCard';

const styles = {
  card: {
    boxShadow: 'none',
    paddingTop: '0.5rem',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#333333',
    fontSize: '1.5em',
  },
};

class CategoryCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: true,
    };
  }

  handleIsExpandedChange = (isExpanded) => {
    this.setState({ isExpanded });
  };

  renderHeader = (category) => (
    <div style={styles.header}>
      <h4 style={styles.headerText}>
        {category.name} ({category.groups.length} Groups)
      </h4>
      <div className="btn-group" role="group">
        <button type="button" className="btn btn-primary">
          Add Group
        </button>
        <button type="button" className="btn btn-default">
          Expand All
        </button>
        <button type="button" className="btn btn-default">
          Minimize All
        </button>
      </div>
    </div>
  );

  render() {
    const { category, courseUsers } = this.props;
    return (
      <Card
        onExpandChange={this.handleIsExpandedChange}
        expanded={this.state.isExpanded}
        style={styles.card}
      >
        <CardHeader
          title={this.renderHeader(category)}
          actAsExpander
          showExpandableButton
          className="category-card-header"
        />
        <CardText expandable className="category-card-body">
          <Divider />
          {category.groups.map((group) => (
            <GroupCard
              key={`group-${group.id}`}
              group={group}
              courseUsers={courseUsers}
            />
          ))}
        </CardText>
      </Card>
    );
  }
}

CategoryCard.propTypes = {
  category: categoryShape.isRequired,
  courseUsers: PropTypes.arrayOf(courseUserShape).isRequired,
};

export default CategoryCard;
