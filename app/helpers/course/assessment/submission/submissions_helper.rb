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

  # Display button to allow the resetting of an answer.
  #
  # @return [String]
  def link_to_reset_answer(answer)
    submission, assessment = answer.submission, answer.submission.assessment
    path =
      reload_answer_course_assessment_submission_path(
        current_course, assessment, submission, answer_id: answer.id, reset_answer: true
      )
    link_to t('course.assessment.answer.reset_answer.button'), path,
            remote: true, method: :post, class: ['btn', 'btn-default', 'reset-answer'],
            title: t('course.assessment.answer.reset_answer.tooltip'),
            data: { confirm: t('course.assessment.answer.reset_answer.warning') }
  end

  def single_question_flag_class(assessment)
    assessment.questions.length > 1 ? 'multi-question' : 'single-question'
  end
end
