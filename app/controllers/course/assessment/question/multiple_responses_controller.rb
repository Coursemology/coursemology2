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
      head :ok
    else
      error = @multiple_response_question.errors.full_messages.to_sentence
      render json: { errors: error }, status: :bad_request
    end
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
