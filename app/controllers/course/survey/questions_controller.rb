# frozen_string_literal: true
class Course::Survey::QuestionsController < Course::Survey::Controller
  load_and_authorize_resource :question, through: :survey, class: Course::Survey::Question.name

  def create
    last_weight = @survey.questions.maximum(:weight)
    @question.weight = last_weight ? last_weight + 1 : 0
    if @question.save
      render_question_json
    else
      render json: { errors: @question.errors }, status: :bad_request
    end
  end

  def update
    if @question.update(question_params)
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

  def question_params
    params.require(:question).
      permit(:description, :question_type, :required, :max_options, :min_options, :grid_view,
             :section_id, options_attributes: [:id, :option, :weight, :file, :_destroy])
  end
end
