# frozen_string_literal: true
class Course::Assessment::SubmissionQuestion::SubmissionQuestionsController < Course::Controller
  load_resource :assessment, class: 'Course::Assessment', through: :course, parent: false

  def all_answers
    @submission = @assessment.submissions.find(all_answers_params[:submission_id])
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
