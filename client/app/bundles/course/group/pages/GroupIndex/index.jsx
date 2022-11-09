import { useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import PageHeader from 'lib/components/navigation/PageHeader';

import GroupNew from '../GroupNew';

const translations = defineMessages({
  groups: {
    id: 'course.group.index.groups',
    defaultMessage: 'Groups',
  },
  noCategory: {
    id: 'course.group.index.noCategory',
    defaultMessage: "You don't have a group category created! Create one now!",
  },
  fetchCategoriesFailure: {
    id: 'course.group.index.fetch.failure',
    defaultMessage: 'Failed to retrieve group categories.',
  },
});

const GroupIndex = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [groupCategories, setGroupCategories] = useState({
    groupCategories: [],
    permissions: { canCreate: false },
  });
  const { groupCategoryId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    CourseAPI.groups
      .fetchGroupCategories()
      .then((response) => {
        // Navigate to the first tab if the url endpoint is of /groups only.
        if (!groupCategoryId && response.data.groupCategories.length > 0) {
          navigate(`${response.data.groupCategories[0].id}`);
        }
        setGroupCategories(response.data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.fetchCategoriesFailure));
        setIsLoading(false);
      });
  }, []);

  const headerToolbars = [];

  if (groupCategories.permissions.canCreate) {
    headerToolbars.push(<GroupNew />);
  }

  const renderTabs =
    groupCategories.groupCategories.length > 1 ? (
      <Tabs
        scrollButtons="auto"
        value={
          parseInt(groupCategoryId, 10) ?? groupCategories.groupCategories[0].id
        }
        variant="scrollable"
      >
        {groupCategories.groupCategories.map((category) => (
          <Tab
            key={category.id}
            component={Link}
            label={category.name}
            to={`${category.id}`}
            value={category.id}
          />
        ))}
      </Tabs>
    ) : null;

  const renderBody =
    groupCategories.groupCategories.length === 0 ? (
      <Note message={intl.formatMessage(translations.noCategory)} />
    ) : (
      <>
        {renderTabs}
        <Outlet />
      </>
    );

  return (
    <>
      <PageHeader
        title={intl.formatMessage(translations.groups)}
        toolbars={headerToolbars}
      />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

GroupIndex.propTypes = {
  intl: PropTypes.object.isRequired,
};

export default injectIntl(GroupIndex);
