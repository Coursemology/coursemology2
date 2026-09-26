import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';

import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import * as commentActions from '../actions/comments';
import AiFeedbackCommentCard from '../components/comment/AiFeedbackCommentCard';
import CommentCard from '../components/comment/CommentCard';
import CommentField from '../components/comment/CommentField';
import { workflowStates } from '../constants';
import { getAssessment } from '../selectors/assessments';
import { getCommentForms } from '../selectors/commentForms';
import { getCommentPosts } from '../selectors/comments';
import { getSubmission } from '../selectors/submissions';
import { getTopics } from '../selectors/topics';
import translations from '../translations';
import { Topic } from '../types';

// DOM id of the new-comment box, which the submission feature specs locate it by.
const newCommentIdentifier = (topicId: number): string => `topic_${topicId}`;

interface Props {
  topic: Topic;
}

// The comment thread under one submission question.
const Comments: FC<Props> = ({ topic }) => {
  const dispatch = useAppDispatch();

  const commentForms = useAppSelector(getCommentForms);
  const allPosts = useAppSelector(getCommentPosts);
  // Read by id rather than off the prop, so the thread follows the store as comments come and go.
  const postIds = useAppSelector((state) => getTopics(state)[topic.id].postIds);
  const graderView = useAppSelector((state) => getSubmission(state).graderView);
  const workflowState = useAppSelector(
    (state) => getSubmission(state).workflowState,
  );
  const autograded = useAppSelector((state) => getAssessment(state).autograded);

  const posts = postIds.map((postId) => allPosts[postId]);
  const renderDelayedCommentButton =
    graderView &&
    !autograded &&
    (workflowState === workflowStates.Submitted ||
      workflowState === workflowStates.Graded);

  const createComment = (
    comment: string,
    isDelayedComment = false,
  ): Promise<void> =>
    dispatch(
      commentActions.create(
        topic.submissionQuestionId,
        comment,
        isDelayedComment,
      ),
    )
      .then(() => {
        toast.success('Successfully created comment.');
      })
      .catch(() => {
        toast.error('Failed to create comment.');
      });

  return (
    <div className="mt-8">
      <Typography className="mb-5" variant="h6">
        <FormattedMessage {...translations.comments} />
      </Typography>

      {posts.map((post) => {
        const isVisible =
          graderView ||
          (!post.isDelayed && post.workflowState !== POST_WORKFLOW_STATE.draft);
        if (!isVisible) {
          return null;
        }

        // An AI-generated draft still awaiting a staff decision uses the rateable card (rate -> edit ->
        // accept/reject) in place of the plain comment card + Publish button.
        if (
          post.isAiGenerated &&
          post.workflowState === POST_WORKFLOW_STATE.draft &&
          post.generatedRating
        ) {
          return (
            // Key on createdAt so a re-generated draft (fresh timestamp) remounts with the new content,
            // resetting the card's local edit state.
            <AiFeedbackCommentCard
              key={`${post.id}-${String(post.createdAt)}`}
              acceptComment={(value) =>
                dispatch(
                  commentActions.acceptAiFeedback(topic.id, post.id, value),
                )
              }
              deleteComment={() =>
                dispatch(commentActions.destroy(topic.id, post.id))
              }
              post={post}
              rateComment={(rating) =>
                dispatch(
                  commentActions.rateAiFeedback(topic.id, post.id, rating),
                )
              }
              rejectComment={(value) =>
                dispatch(
                  commentActions.rejectAiFeedback(topic.id, post.id, value),
                )
              }
            />
          );
        }

        return (
          <CommentCard
            key={post.id}
            deleteComment={() =>
              dispatch(commentActions.destroy(topic.id, post.id))
            }
            editValue={commentForms.posts[post.id]}
            handleChange={(value) =>
              dispatch(commentActions.onUpdateChange(post.id, value))
            }
            isUpdatingAnnotationAllowed
            post={post}
            publishComment={(value) =>
              dispatch(commentActions.publish(topic.id, post.id, value ?? ''))
            }
            updateComment={(value) =>
              dispatch(commentActions.update(topic.id, post.id, value ?? ''))
            }
          />
        );
      })}

      <CommentField
        createComment={createComment}
        handleChange={(comment: string) =>
          dispatch(commentActions.onCreateChange(topic.id, comment))
        }
        inputId={newCommentIdentifier(topic.id)}
        isSubmittingDelayedComment={commentForms.isSubmittingDelayedComment}
        isSubmittingNormalComment={commentForms.isSubmittingNormalComment}
        isUpdatingComment={commentForms.isUpdatingComment}
        renderDelayedCommentButton={renderDelayedCommentButton}
        value={commentForms.topics[topic.id]}
      />
    </div>
  );
};

export default Comments;
