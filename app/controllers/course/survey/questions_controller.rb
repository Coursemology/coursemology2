# frozen_string_literal: true
class Course::Survey::QuestionsController < Course::Survey::SurveysController
  load_and_authorize_resource :question, through: :survey, class: Course::Survey::Question.name

  def create
    @question.weight = @survey.questions.count
    build_existing_responses_answers
    render json: { errors: @question.errors }, status: :bad_request unless @question.save
  end

  def update
    if @question.update_attributes(question_params)
      render partial: 'question', locals: { question: @question }
    else
      render json: { errors: @question.errors }, status: :bad_request
    end
  end

  def destroy
    if @question.destroy
      head :ok
    else
      head :bad_request
    end
  end

  private

  def build_existing_responses_answers
    @survey.responses.each do |response|
      @question.answers.build(response: response) do |answer|
        @question.options.each do |option|
          answer.options.build(question_option: option)
        end
      end
    end
  end

  def question_params
    params.require(:question).
      permit(:description, :question_type, :required, :max_options, :min_options, :grid_view,
             options_attributes: [:id, :option, :weight, :image, :_destroy])
  end
end
