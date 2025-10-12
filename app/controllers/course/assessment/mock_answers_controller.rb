# frozen_string_literal: true
class Course::Assessment::MockAnswersController < Course::Assessment::QuestionsController
  load_and_authorize_resource :mock_answer, class: 'Course::Assessment::Question::MockAnswer', through: :question

  def create
    @mock_answer.question = @question
    if @mock_answer.save
      render json: { id: @mock_answer.id }, status: :ok
    else
      render json: { errors: @mock_answer.errors }, status: :bad_request
    end
  end

  private

  def mock_answer_params
    params.require(:mock_answer).permit(:answer_text)
  end
end
