import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import ErrorCard from 'lib/components/ErrorCard';

import { categoryShape, courseUserShape } from '../propTypes';
import { fetchGroupData } from '../actions';
import { errorMessages } from '../constants';
import CategoryCard from '../components/CategoryCard';
import UserTable from '../components/UserTable';

const styles = {
  navItem: {
    cursor: 'pointer',
  },
};

// TODO: Internationalise strings
class Groups extends React.Component {
  static tabs = [
    {
      id: 0,
      label: 'By Groups',
    },
    {
      id: 1,
      label: 'By Users',
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      tab: 0, // 0 - group-level tab, 1 - user-level tab
    };
  }

  componentDidMount() {
    this.props.dispatch(fetchGroupData());
  }

  renderByGroups = () => {
    const { categories, courseUsers } = this.props;
    return categories.map((category) => (
      <CategoryCard
        key={`category-${category.id}`}
        category={category}
        courseUsers={courseUsers}
      />
    ));
  };

  renderByUsers = () => {
    const { courseUsers } = this.props;
    return <UserTable courseUsers={courseUsers} />;
  };

  renderHeader = () => (
    <div className="page-header">
      <h1>
        <span>Groups</span>
        <div className="pull-right">
          {this.state.tab === 0 ? (
            <div className="btn-group" role="group">
              <button type="button" className="btn btn-primary">
                Add Category
              </button>
              <button type="button" className="btn btn-default">
                Expand All
              </button>
              <button type="button" className="btn btn-default">
                Minimize All
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-primary">
              Upload Groupings
            </button>
          )}
        </div>
      </h1>
    </div>
  );

  renderTabContent = () => {
    switch (this.state.tab) {
      case 0:
        return this.renderByGroups();
      case 1:
        return this.renderByUsers();
      default:
        return null;
    }
  };

  renderTabs = () => (
    <ul className="nav nav-tabs">
      {Groups.tabs.map((tab) => {
        const isActive = this.state.tab === tab.id;
        return (
          <li
            role="presentation"
            key={`tab-${tab.id}`}
            className={isActive ? 'active' : ''}
          >
            <a
              onClick={() => {
                this.setState({ tab: tab.id });
              }}
              style={isActive ? {} : styles.navItem}
            >
              {tab.label}
            </a>
          </li>
        );
      })}
    </ul>
  );

  render() {
    const { isFetching, hasFetchError } = this.props;
    if (isFetching) {
      return <LoadingIndicator />;
    }
    if (hasFetchError) {
      return (
        <>
          {this.renderHeader()}
          <ErrorCard message={errorMessages.fetchFailure} />
        </>
      );
    }

    return (
      <>
        {this.renderHeader()}
        {this.renderTabs()}
        {this.renderTabContent()}
      </>
    );
  }
}

Groups.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  hasFetchError: PropTypes.bool.isRequired,
  categories: PropTypes.arrayOf(categoryShape).isRequired,
  courseUsers: PropTypes.arrayOf(courseUserShape).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ groupsFetch }) => ({
  isFetching: groupsFetch.isFetching,
  hasFetchError: groupsFetch.hasFetchError,
  categories: groupsFetch.categories,
  courseUsers: groupsFetch.courseUsers,
}))(Groups);
