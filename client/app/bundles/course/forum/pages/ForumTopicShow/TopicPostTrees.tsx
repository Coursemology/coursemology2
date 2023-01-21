import { FC } from 'react';
import { ForumTopicEntity } from 'types/course/forums';

import PostCard from '../../components/cards/PostCard';

interface Props {
  postIdsArray: ForumTopicEntity['postTreeIds'];
  level: number;
}

const TopicPostTrees: FC<Props> = (props) => {
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

        if (arrayContent.length === 0) return null;

        const topicPostTreesKey =
          typeof arrayContent[0] === 'number'
            ? `post_tree_node_${arrayContent[0]}_level_${level}`
            : `post_tree_node_children_level_${level}`;

        return (
          <TopicPostTrees
            key={topicPostTreesKey}
            level={level + 1}
            postIdsArray={arrayContent}
          />
        );
      })}
    </div>
  );
};

export default TopicPostTrees;
