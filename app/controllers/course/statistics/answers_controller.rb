# frozen_string_literal: true
class Course::Statistics::AnswersController < Course::Statistics::Controller
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  def question_answer_details
    @answer = Course::Assessment::Answer.find(answer_params[:id])
    @submission = @answer.submission
    @assessment = @submission.assessment
  end

  private

  def answer_params
    params.permit(:id)
  end
end
