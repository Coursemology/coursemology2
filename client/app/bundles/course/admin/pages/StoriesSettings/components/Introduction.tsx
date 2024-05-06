import { ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  AssistantOutlined,
  FaceOutlined,
  FlagOutlined,
  SupervisorAccountOutlined,
  SvgIconComponent,
  Sync,
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import poweredByCikgo from 'assets/powered-by-cikgo.svg?url';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  integrationHint: {
    id: 'course.admin.storiesSettings.integrationHint',
    defaultMessage:
      "To integrate your course on Cikgo with this course, enter its integration key here. Here's what's going to " +
      'happen once this course is integrated with Cikgo.',
  },
  redirects: {
    id: 'course.admin.storiesSettings.redirects',
    defaultMessage:
      "When students access this <link>course's root URL</link>, they'll be redirected to the Learn page. The home " +
      'page is still accessible from the sidebar.',
  },
  syncs: {
    id: 'course.admin.storiesSettings.syncs',
    defaultMessage:
      'Published assessments, videos, and surveys in this course will be available in and kept in sync with Cikgo ' +
      'as resources.',
  },
  onlyOwnersCanManage: {
    id: 'course.admin.storiesSettings.onlyOwnersCanManage',
    defaultMessage:
      'Only you, Owners, and Managers can configure the integration of this course with Cikgo.',
  },
  autoCreateAccounts: {
    id: 'course.admin.storiesSettings.autoCreateAccounts',
    defaultMessage:
      "User accounts and chat rooms on Cikgo will automatically be created if they don't yet exist. Information " +
      'shared with Cikgo is governed by <ourPpLink>our Privacy Policy</ourPpLink> and ' +
      "<cikgoPpLink>Cikgo's Privacy Policy</cikgoPpLink>.",
  },
  publishTaskCompletions: {
    id: 'course.admin.storiesSettings.publishTaskCompletions',
    defaultMessage:
      "Student's submission statuses will be reflected in their chat rooms in Cikgo.",
  },
});

const IntroductionItem = ({
  Icon,
  children,
}: {
  Icon: SvgIconComponent;
  children?: ReactNode;
}): JSX.Element => {
  return (
    <div className="flex space-x-5 text-neutral-500">
      <div>
        <Icon className="text-[3rem] shrink-0 p-2 rounded-xl bg-neutral-100" />
      </div>

      <div className="flex flex-col justify-center">
        <Typography variant="body2">{children}</Typography>
      </div>
    </div>
  );
};

const Introduction = ({ className }: { className?: string }): JSX.Element => {
  const { t } = useTranslation();

  const { courseId } = useParams();

  return (
    <div className={`space-y-5 ${className ?? ''}`}>
      <img alt="Powered by Cikgo" className="h-14" src={poweredByCikgo} />

      <Typography className="!mt-3" variant="body2">
        {t(translations.integrationHint)}
      </Typography>

      <div className="space-y-4">
        <IntroductionItem Icon={AssistantOutlined}>
          {t(translations.redirects, {
            link: (chunk) => (
              <Link opensInNewTab to={`/courses/${courseId}`}>
                {chunk}
              </Link>
            ),
          })}
        </IntroductionItem>

        <IntroductionItem Icon={Sync}>{t(translations.syncs)}</IntroductionItem>

        <IntroductionItem Icon={FlagOutlined}>
          {t(translations.publishTaskCompletions)}
        </IntroductionItem>

        <IntroductionItem Icon={SupervisorAccountOutlined}>
          {t(translations.onlyOwnersCanManage)}
        </IntroductionItem>

        <IntroductionItem Icon={FaceOutlined}>
          {t(translations.autoCreateAccounts, {
            ourPpLink: (chunk) => (
              <Link opensInNewTab to="/pages/privacy_policy">
                {chunk}
              </Link>
            ),
            cikgoPpLink: (chunk) => (
              <Link
                external
                opensInNewTab
                to="https://cikgo.com/privacy-policy"
              >
                {chunk}
              </Link>
            ),
          })}
        </IntroductionItem>
      </div>
    </div>
  );
};

export default Introduction;
