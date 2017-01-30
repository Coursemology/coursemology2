# frozen_string_literal: true
class Course::Survey::QuestionsController < Course::Survey::SurveysController
  load_and_authorize_resource :question, through: :survey, class: Course::Survey::Question.name

  def create
    @question.weight = @survey.questions.count
    render json: { errors: @question.errors }, status: :bad_request unless @question.save
  end

  private

  def question_params
    params.require(:question).
      permit(:description, :question_type, :required, :max_options, :min_options,
             options_attributes: [:option, :weight])
  end
end
