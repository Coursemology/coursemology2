# frozen_string_literal: true
class Course::Assessment::SubmissionQuestion::SubmissionQuestionsController < Course::Controller
  load_resource :assessment, class: 'Course::Assessment', through: :course, parent: false

  def all_answers
    # `all_answers_params[:submission_id]` is an Attempt id — the wire key `submissionId` carries
    # the attempt's id, not the extension table's own id. Find by attempt, then navigate to the real
    # Submission for `authorize!`, whose `can :read, ...Submission` rules match on subject class.
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
