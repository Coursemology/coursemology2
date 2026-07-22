# frozen_string_literal: true
class Course::Assessment::SubmissionQuestion::SubmissionQuestionsController < Course::Controller
  load_resource :assessment, class: 'Course::Assessment', through: :course, parent: false

  def all_answers
    # `all_answers_params[:submission_id]` is, by the statistics feature's own established
    # convention (see `Course::Statistics::AssessmentsController#submission_statistics`/
    # `#live_feedback_statistics`, which serialize `Attempt#id` under the wire key `id`/
    # `submissionId`), an Attempt id — not Submission's own (small-table) id. Find by attempt, then
    # navigate to the real Submission for `authorize!` (CanCan's `can :read, ...Submission` rules
    # match on subject class — see `Answer#can_read_grade?`'s identical fix, Step 2d). Genuine bug
    # the split exposed; not listed in the brief's file set, found via the acceptance gate.
    @submission = @assessment.attempts.find(all_answers_params[:submission_id]).submission
    authorize!(:read, @submission)
    @submission_question = @submission.
                           submission_questions.
                           where(
                             question_id: all_answers_params[:question_id]
                           ).
                           includes(actable: { files: { annotations:
                                             { discussion_topic: { posts: :codaveri_feedback } } } },
                                    discussion_topic: { posts: :codaveri_feedback }).first
    @all_answers = @submission.answers.
                   without_attempting_state.
                   unscope(:order).
                   order(:created_at).
                   where(
                     question_id: all_answers_params[:question_id]
                   )
  end

  private

  def all_answers_params
    params.permit(:submission_id, :question_id)
  end
end
