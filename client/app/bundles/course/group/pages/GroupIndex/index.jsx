import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Tab, Tabs } from '@mui/material';
import { Outlet, useParams, useNavigate, Link } from 'react-router-dom';
import Note from 'lib/components/Note';
import CourseAPI from 'api/course';
import PageHeader from 'lib/components/pages/PageHeader';
import LoadingIndicator from 'lib/components/LoadingIndicator';
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
        value={
          parseInt(groupCategoryId, 10) ?? groupCategories.groupCategories[0].id
        }
        variant="scrollable"
        scrollButtons="auto"
      >
        {groupCategories.groupCategories.map((category) => (
          <Tab
            key={category.id}
            label={category.name}
            value={category.id}
            to={`${category.id}`}
            component={Link}
          />
        ))}
      </Tabs>
    ) : (
      <></>
    );

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
