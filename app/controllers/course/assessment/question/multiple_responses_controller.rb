# frozen_string_literal: true
class Course::Assessment::Question::MultipleResponsesController < Course::Assessment::Question::Controller
  include Course::Assessment::Question::MultipleResponsesConcern
  build_and_authorize_new_question :multiple_response_question,
                                   class: Course::Assessment::Question::MultipleResponse, only: [:new, :create]
  load_and_authorize_resource :multiple_response_question,
                              class: 'Course::Assessment::Question::MultipleResponse',
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]

  def new
    @multiple_response_question.grading_scheme = :any_correct if params[:multiple_choice] == 'true'
  end

  def create
    if @multiple_response_question.save
      render json: {
        redirectUrl: course_assessment_path(current_course, @assessment),
        redirectEditUrl: edit_course_assessment_question_multiple_response_path(
          current_course, @assessment, @multiple_response_question
        )
      }
    else
      render json: { errors: @multiple_response_question.errors }, status: :bad_request
    end
  end

  def edit
  end

  def update
    if params.key?(:multiple_choice)
      respond_to_switch_mcq_mrq_type
      return
    end

    update_skill_ids_if_params_present(multiple_response_question_params[:question_assessment])

    if update_multiple_response_question
      render json: {
        redirectUrl: course_assessment_path(current_course, @assessment),
        redirectEditUrl: edit_course_assessment_question_multiple_response_path(
          current_course, @assessment, @multiple_response_question
        )
      }
    else
      render json: { errors: @multiple_response_question.errors }, status: :bad_request
    end
  end

  def destroy
    if @multiple_response_question.destroy
      super

      head :ok
    else
      error = @multiple_response_question.errors.full_messages.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  def generate
    generation_params = parse_generation_params

    unless validate_generation_params(generation_params)
      render json: { success: false, message: 'Invalid parameters' }, status: :bad_request
      return
    end

    generation_service = Course::Assessment::Question::MrqGenerationService.new(@assessment, generation_params)
    generated_questions = generation_service.generate_questions
    questions = generated_questions['questions'] || []

    if questions.empty?
      render json: { success: false, message: 'No questions were generated' }, status: :bad_request
      return
    end

    render json: format_generation_response(questions), status: :ok
  rescue StandardError => e
    Rails.logger.error "MCQ/MRQ Generation Error: #{e.message}"
    render json: { success: false, message: 'An error occurred while generating questions' },
           status: :internal_server_error
  end

  private

  def respond_to_switch_mcq_mrq_type
    is_mcq = params[:multiple_choice] == 'true'
    unsubmit = params[:unsubmit] != 'false'

    if switch_mcq_mrq_type(is_mcq, unsubmit)
      render partial: 'multiple_response_details', locals: {
        assessment: @assessment,
        question: @multiple_response_question,
        new_question: false,
        full_options: false
      }
    else
      render json: { errors: @multiple_response_question.errors.full_messsages.to_sentence }, status: :bad_request
    end
  end

  def update_multiple_response_question
    @multiple_response_question.update(
      multiple_response_question_params.except(:question_assessment, :multiple_choice)
    )
  end

  def multiple_response_question_params
    params.require(:question_multiple_response).permit(
      :title, :description, :staff_only_comments, :maximum_grade, :grading_scheme,
      :randomize_options, :skip_grading, question_assessment: { skill_ids: [] },
                                         options_attributes: [:_destroy, :id, :correct, :option,
                                                              :explanation, :weight, :ignore_randomization]
    )
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@multiple_response_question)
  end

  def parse_generation_params
    {
      custom_prompt: params[:custom_prompt] || '',
      number_of_questions: (params[:number_of_questions] || 1).to_i,
      question_type: params[:question_type],
      source_question_data: parse_source_question_data
    }
  end

  def parse_source_question_data
    return {} unless params[:source_question_data].present?

    JSON.parse(params[:source_question_data])
  rescue JSON::ParserError
    {}
  end

  def validate_generation_params(params)
    params[:custom_prompt].present? &&
      params[:number_of_questions] >= 1 && params[:number_of_questions] <= 10 &&
      %w[mrq mcq].include?(params[:question_type])
  end

  def format_generation_response(questions)
    {
      success: true,
      data: {
        title: questions.first['title'],
        description: questions.first['description'],
        options: format_options(questions.first['options']),
        allQuestions: questions.map { |question| format_question(question) },
        numberOfQuestions: questions.length
      }
    }
  end

  def format_options(options)
    options.map.with_index do |option, index|
      {
        id: index + 1,
        option: option['option'],
        correct: option['correct'],
        weight: index + 1,
        explanation: option['explanation'] || '',
        ignoreRandomization: false,
        toBeDeleted: false
      }
    end
  end

  def format_question(question)
    {
      title: question['title'],
      description: question['description'],
      options: format_options(question['options'])
    }
  end
end
