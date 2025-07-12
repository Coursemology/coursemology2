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
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
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
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
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
    # Parse the form data
    custom_prompt = params[:custom_prompt] || ''
    number_of_questions = (params[:number_of_questions] || 1).to_i
    
    # Parse source_question_data from JSON string
    source_question_data = {}
    if params[:source_question_data].present?
      begin
        source_question_data = JSON.parse(params[:source_question_data])
      rescue JSON::ParserError => e
        Rails.logger.warn "Failed to parse source_question_data: #{e.message}"
        source_question_data = {}
      end
    end

    # Validate parameters
    if custom_prompt.blank?
      render json: { success: false, message: 'Custom prompt is required' }, status: :bad_request
      return
    end

    if number_of_questions < 1 || number_of_questions > 3
      render json: { success: false, message: 'Number of questions must be between 1 and 3' }, status: :bad_request
      return
    end

    # Create generation service
    generation_service = Course::Assessment::Question::MrqGenerationService.new(
      @assessment,
      {
        custom_prompt: custom_prompt,
        number_of_questions: number_of_questions,
        source_question_data: source_question_data
      }
    )

    # Generate questions
    generated_questions = generation_service.generate_questions
    # Transform the response to match the expected frontend format
    questions = generated_questions['questions'] || []

    if questions.empty?
      render json: { success: false, message: 'No questions were generated' }, status: :internal_server_error
      return
    end
    # Format response for frontend
    response_data = {
      success: true,
      data: {
        title: questions.first['title'],
        description: questions.first['description'],
        options: questions.first['options'].map.with_index do |option, index|
          {
            id: index + 1,
            option: option['option'],
            correct: option['correct'],
            weight: index + 1,
            explanation: option['explanation'] || '',
            ignoreRandomization: false,
            toBeDeleted: false
          }
        end,
        allQuestions: questions.map.with_index do |question, q_index|
          {
            title: question['title'],
            description: question['description'],
            options: question['options'].map.with_index do |option, index|
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
          }
        end,
        numberOfQuestions: questions.length
      }
    }

    render json: response_data, status: :ok
  rescue StandardError => e
    Rails.logger.error "MRQ Generation Error: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
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
end
