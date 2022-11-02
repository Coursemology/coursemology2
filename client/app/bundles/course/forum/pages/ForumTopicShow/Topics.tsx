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
              postId={arrayContent}
              level={level}
            />
          );
        }
        return (
          <Topics
            // The first member of the nested array will always be number
            key={`topic_${postIdsArray[0][0] as number}`}
            postIdsArray={arrayContent}
            level={level + 1}
          />
        );
      })}
    </div>
  );
};

export default Topics;
