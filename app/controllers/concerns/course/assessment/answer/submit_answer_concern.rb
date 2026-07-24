# frozen_string_literal: true
# Shared auto-grade-on-submit behaviour for per-answer submission. Extracted from
# Course::Assessment::Submission::Answer::AnswersController so the marketplace preview
# controller can reuse the exact same submit path. Expects @assessment and @submission to
# be set, and the including controller to be able to `render`.
module Course::Assessment::Answer::SubmitAnswerConcern
  extend ActiveSupport::Concern

  protected

  def should_auto_grade_on_submit(answer)
    mcq = [I18n.t('course.assessment.question.multiple_responses.question_type.multiple_response'),
           I18n.t('course.assessment.question.multiple_responses.question_type.multiple_choice')]

    !mcq.include?(answer.question.question_type_readable) ||
      !@submission.assessment.allow_partial_submission ||
      @submission.assessment.show_mcq_answer
  end

  # Named auto_grade_answer (not auto_grade) so it does not collide with a whole-submission
  # `auto_grade` action a host controller may define (the marketplace preview controller does).
  def auto_grade_answer(answer)
    return unless valid_for_grading?(answer)

    # Check if the last attempted answer is still being evaluated, then dont reattempt.
    job = last_attempt_answer_submitted_job(answer) || reattempt_and_grade_answer(answer)&.job
    if job
      render partial: 'jobs/submitted', locals: { job: job }
    else
      render answer
    end
  end

  # Test whether the answer can be graded or not.
  def valid_for_grading?(answer)
    return true if @assessment.autograded?
    return true unless answer.specific.is_a?(Course::Assessment::Answer::Programming)

    answer.specific.attempting_times_left > 0 || can?(:manage, @assessment)
  end

  def last_attempt_answer_submitted_job(answer)
    submission = answer.submission

    attempts = submission.answers.from_question(answer.question_id)
    last_non_current_answer = attempts.reject(&:current_answer?).last
    auto_grading = last_non_current_answer&.auto_grading
    job = auto_grading&.job
    (job&.status == 'submitted') ? job : nil
  end

  def reattempt_and_grade_answer(answer)
    # The transaction is to make sure that the new attempt, auto grading and job are present when
    # the current answer is submitted.
    #
    # If the latest answer has an errored job, the user may still modify current_answer before
    # grading again. Failed autograding jobs should not count towards their answer attempt limit,
    # so destroy the failed job answer and re-grade the current entry.
    answer.class.transaction do
      last_answer = answer.submission.answers.select { |ans| ans.question_id == answer.question_id }.last
      last_answer_job = last_answer&.auto_grading&.job
      last_answer.destroy! if last_answer_job&.errored?
      new_answer = reattempt_answer(answer, finalise: true)
      new_answer.auto_grade!(redirect_to_path: nil, reduce_priority: false)
    end
  end

  def reattempt_answer(answer, finalise: true)
    new_answer = answer.question.attempt(answer.submission, answer)
    new_answer.finalise! if finalise
    new_answer.save!
    new_answer
  end
end
