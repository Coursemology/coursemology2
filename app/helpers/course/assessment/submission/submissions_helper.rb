# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsHelper
  include Course::Assessment::Submission::SubmissionsAutogradedHelper
  include Course::Assessment::Submission::SubmissionsWorkflowStateHelper
  include Course::Assessment::Answer::ProgrammingHelper
  include Course::Assessment::Answer::ProgrammingTestCaseHelper

  # Gets the ID for the given submission_question's comments container.
  #
  # @param [Course::Assessment::SubmissionQuestion] submission_question The submission_question
  #   to get the ID for
  # @return [String] The ID for the given submission_question's comments container.
  def comments_container_id(submission_question)
    "course_assessment_submission_question_#{submission_question.id}_comments"
  end

  # Return the CSS class of the explanation based on the correctness of the answer.
  #
  # @return [String]
  def explanation_panel_class(answer)
    answer.correct ? 'panel-success' : 'panel-danger'
  end

  # Return the last graded attempted answer based on the status of current submission,
  # or the last attempt if there are no evaluated or graded answers.
  #
  # @return [Course::Assessment::Answer]
  def last_attempt(answer)
    submission = answer.submission
    attempts = submission.answers.from_question(answer.question_id)
    graded_or_evaluated = attempts.select { |x| ['evaluated', 'graded'].include?(x.workflow_state) }
    graded_or_evaluated.empty? ? attempts.last : graded_or_evaluated.last
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

  def enable_submit_button?(answer)
    if answer.attempting_times_left > 0
      true
    else
      can?(:manage, answer.submission.assessment)
    end
  end

  # Return the bootstrap panel class based on the status of the submission
  def panel_class
    if @submission.attempting?
      'panel-warning'
    elsif @submission.graded?
      'panel-info'
    elsif @submission.published?
      'panel-success'
    else
      'panel-default'
    end
  end
end
