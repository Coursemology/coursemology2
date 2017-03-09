# frozen_string_literal: true
class Course::Survey::QuestionsController < Course::Survey::SurveysController
  load_and_authorize_resource :question, through: :survey, class: Course::Survey::Question.name

  def create
    last_weight = @survey.questions.maximum(:weight)
    @question.weight = last_weight ? last_weight + 1 : 0
    build_existing_responses_answers
    if @question.save
      render_question_json
    else
      render json: { errors: @question.errors }, status: :bad_request
    end
  end

  def update
    if @question.update_attributes(question_params)
      render_question_json
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

  def load_question_options
    @question_options ||= @question.options.includes(attachment_references: :attachment)
  end

  def render_question_json
    load_question_options
    render partial: 'question', locals: { question: @question }
  end

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
             options_attributes: [:id, :option, :weight, :file, :_destroy])
  end
end
