import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import { getAllUserMiniEntities } from '../../selectors';
import PageHeader from 'lib/components/pages/PageHeader';
import { fetchUsers } from '../../operations';
// import AchievementTable from '../../components/tables/AchievementTable';
// import AchievementNew from '../AchievementNew';
// import AchievementReordering from '../../components/misc/AchievementReordering';

interface Props {
  intl?: any;
}

// const styles = {
// };

const translations = defineMessages({
  fetchUsersFailure: {
    id: 'course.users.index.fetch.failure',
    defaultMessage: 'Failed to retrieve course users.',
  },
});

const UsersIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const users = useSelector((state: AppState) => getAllUserMiniEntities(state));
  //   const achievementPermissions = useSelector((state: AppState) =>
  //     getAchievementPermissions(state),
  //   );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
      );
  }, [dispatch]);

  useEffect(() => {
    console.log('sup');
    console.log('my users are ', users);
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const headerToolbars: ReactElement[] = []; // To Add: Reorder Button

  //   if (achievementPermissions?.canReorder) {
  //     headerToolbars.push(
  //       <AchievementReordering key="achievementReorderingButton" />,
  //     );
  //   }

  //   if (achievementPermissions?.canCreate) {
  //     headerToolbars.push(
  //       <Button
  //         className="new-achievement-button"
  //         key="new-achievement-button"
  //         variant="outlined"
  //         color="primary"
  //         onClick={(): void => setIsOpen(true)}
  //         style={styles.newButton}
  //       >
  //         {intl.formatMessage(translations.newAchievement)}
  //       </Button>,
  //     );
  //   }

  return (
    <>
      <PageHeader
        title={intl.formatMessage({
          id: 'course.users.header',
          defaultMessage: 'Students',
        })}
        toolbars={headerToolbars}
      />
      <>hello world</>
    </>
  );
};

export default injectIntl(UsersIndex);
