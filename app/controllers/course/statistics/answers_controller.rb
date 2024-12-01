# frozen_string_literal: true
class Course::Statistics::AnswersController < Course::Statistics::Controller
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')
  load_resource :answer, class: 'Course::Assessment::Answer', only: :show

  def show
    @submission = @answer.submission
    @assessment = @submission.assessment
  end

  def all_answers
    @submission_question = Course::Assessment::SubmissionQuestion.
                           where(
                             submission_id: all_answers_params[:submission_id],
                             question_id: all_answers_params[:question_id]
                           ).
                           includes(actable: { files: { annotations:
                                             { discussion_topic: { posts: :codaveri_feedback } } } },
                                    discussion_topic: { posts: :codaveri_feedback }).first
    @all_answers = Course::Assessment::Answer.
                   unscope(:order).
                   order(:created_at).
                   where(
                     submission_id: all_answers_params[:submission_id],
                     question_id: all_answers_params[:question_id]
                   ).
                   where.not(workflow_state: :attempting)
  end

  private

  def all_answers_params
    params.permit(:submission_id, :question_id)
  end
end
