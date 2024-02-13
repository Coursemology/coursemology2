# frozen_string_literal: true
class Course::Statistics::AnswersController < Course::Statistics::Controller
  def answer_details
    answer = Course::Assessment::Answer.find(answer_params[:id])
    @question = answer.question
  end

  private

  def answer_params
    params.permit(:id)
  end
end
