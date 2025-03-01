import { FC, memo } from 'react';
import { List, Typography } from '@mui/material';
import equal from 'fast-deep-equal';

import Section from 'lib/components/core/layouts/Section';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { EXPAND_SWITCH_TYPE } from '../constants';
import { getAllCourses } from '../selectors';
import translations from '../translations';

import ExpandAllSwitch from './buttons/ExpandAllSwitch';
import CourseTab from './CourseTab';

const ForumList: FC = () => {
  const { t } = useTranslation();
  const courses = useAppSelector((state) => getAllCourses(state));

  return (
    <Section
      contentClassName="flex flex-col space-y-3"
      sticksToNavbar
      subtitle={t(translations.forumSectionSubtitle)}
      title={t(translations.forumSectionTitle)}
    >
      {courses.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <Typography align="center" variant="body1">
            {t(translations.noRelatedCourses)}
          </Typography>
        </div>
      ) : (
        <section>
          <div className="flex justify-between items-center mb-4">
            <ExpandAllSwitch type={EXPAND_SWITCH_TYPE.courses} />
            <div className="pr-5 space-x-48 flex justify-end">
              <Typography
                align="center"
                className="max-w-10 pr-24"
                variant="body2"
              >
                {t(translations.knowledgeBaseStatusSettings)}
              </Typography>
            </div>
          </div>
          <List
            className="p-0 w-full border border-solid border-neutral-300 rounded-lg"
            dense
          >
            {courses.map((c) => (
              <CourseTab key={c.id} course={c} level={0} />
            ))}
          </List>
        </section>
      )}
    </Section>
  );
};

export default memo(ForumList, equal);
