import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Avatar, IconButton } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

interface PostCreatorProps {
  creator?: { id: number; userUrl: string; name: string; imageUrl: string };
  isAnonymous?: boolean;
  canViewAnonymous?: boolean;
}

interface PostCreatorReturnProps {
  avatar: JSX.Element | null;
  name: string;
  userUrl: string | null;
  visibilityIcon: JSX.Element | null;
}

const translations = defineMessages({
  postAnonymously: {
    id: 'course.forum.PostCreatorObject.postAnonymously',
    defaultMessage: 'Anonymous post',
  },
  anonymousUser: {
    id: 'course.forum.PostCreatorObject.anonymousUser',
    defaultMessage: 'Anonymous User',
  },
  maskUser: {
    id: 'course.forum.PostCreatorObject.maskUser',
    defaultMessage: 'Mask User',
  },
  unmaskUser: {
    id: 'course.forum.PostCreatorObject.unmaskUser',
    defaultMessage: 'Unmask User',
  },
});

const PostCreatorObject = (props: PostCreatorProps): PostCreatorReturnProps => {
  const { creator, canViewAnonymous = false, isAnonymous = false } = props;
  const { t } = useTranslation();
  const [hideAvatar, setHideAvatar] = useState(true);

  let postCreatorData: PostCreatorReturnProps = {
    avatar: null,
    name: '',
    userUrl: null,
    visibilityIcon: null,
  };

  const canAccessAnonymous = canViewAnonymous && isAnonymous;

  if (creator && !isAnonymous) {
    postCreatorData = {
      avatar: (
        <Avatar
          alt={creator.name}
          className="h-20 w-20"
          component={Link}
          src={creator.imageUrl}
          to={creator.userUrl}
          underline="none"
        />
      ),
      name: creator.name,
      userUrl: creator.userUrl,
      visibilityIcon: null,
    };
  } else if (creator && canAccessAnonymous && !hideAvatar) {
    // If someone can see the real identity of the anonymous post
    postCreatorData = {
      avatar: (
        <Avatar
          alt={creator.name}
          className="h-20 w-20"
          component={Link}
          src={creator.imageUrl}
          to={creator.userUrl}
          underline="none"
        />
      ),
      name: creator.name,
      userUrl: creator.userUrl,
      visibilityIcon: (
        <IconButton
          className="py-0"
          edge="end"
          onClick={(): void => setHideAvatar(true)}
          onMouseDown={(e): void => e.preventDefault()}
          title={t(translations.maskUser)}
        >
          <VisibilityOff />
        </IconButton>
      ),
    };
  } else if (creator && canAccessAnonymous && hideAvatar) {
    postCreatorData = {
      avatar: <Avatar className="h-20 w-20">?</Avatar>,
      name: t(translations.anonymousUser),
      userUrl: null,
      visibilityIcon: (
        <IconButton
          className="py-0"
          edge="end"
          onClick={(): void => setHideAvatar(false)}
          onMouseDown={(e): void => e.preventDefault()}
          title={t(translations.unmaskUser)}
        >
          <Visibility />
        </IconButton>
      ),
    };
  } else if (isAnonymous && !canAccessAnonymous) {
    postCreatorData = {
      avatar: <Avatar className="h-20 w-20">?</Avatar>,
      name: t(translations.anonymousUser),
      userUrl: null,
      visibilityIcon: null,
    };
  }

  return postCreatorData;
};

export default PostCreatorObject;
