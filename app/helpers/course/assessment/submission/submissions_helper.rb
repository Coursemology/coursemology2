# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsHelper
  include Course::Assessment::Submission::SubmissionsGuidedHelper
  include Course::Assessment::Answer::ProgrammingHelper

  # Gets the ID for the given answer's comments container.
  #
  # @param [Course::Assessment::Answer] answer The answer to get the ID for
  # @return [String] The ID for the given answer's comments.
  def comments_container_id(answer)
    "course_assessment_submission_answer_#{answer.id}_comments"
  end

  # Finds the comment being created/edited, or constructs a new one in reply to the latest post.
  #
  # @param [Course::Discussion::Topic] topic The topic being replied to.
  # @return [Course::Discussion::Post]
  def new_comments_post(topic)
    new_post = topic.posts.find(&:new_record?)
    return new_post if new_post

    topic.posts.build
  end

  # Return the CSS class of the explanation based on the correctness of the answer.
  #
  # @return [String]
  def explanation_panel_class(answer)
    answer.correct ? 'panel-success' : 'panel-danger'
  end

  # Return the last attempted answer based on the status of current submission.
  # previous attempt if submission is in attempting state.
  # current attempt if submission is in submitted or graded state.
  #
  # @return [Course::Assessment::Answer]
  def last_attempt(answer)
    submission = answer.submission
    attempts = submission.answers.from_question(answer.question_id)
    submission.attempting? ? attempts[-2] : attempts[-1]
  end
end
