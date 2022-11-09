import { FC } from 'react';
import { ForumTopicEntity } from 'types/course/forums';

import PostCard from '../../components/cards/PostCard';

interface Props {
  postIdsArray: ForumTopicEntity['postTreeIds'];
  level: number;
}

const Topics: FC<Props> = (props) => {
  const { level, postIdsArray } = props;

  if (!postIdsArray || postIdsArray?.length === 0) return null;

  return (
    <div className="space-y-5">
      {postIdsArray.map((arrayContent) => {
        if (typeof arrayContent === 'number') {
          return (
            <PostCard
              key={`post_${arrayContent}`}
              level={level}
              postId={arrayContent}
            />
          );
        }
        return (
          <Topics
            // The first member of the nested array will always be number
            key={`topic_${postIdsArray[0][0] as number}`}
            level={level + 1}
            postIdsArray={arrayContent}
          />
        );
      })}
    </div>
  );
};

export default Topics;
