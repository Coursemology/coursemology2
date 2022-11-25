# frozen_string_literal: true
class Course::Assessment::Question::MultipleResponsesController < Course::Assessment::Question::Controller
  include Course::Assessment::Question::MultipleResponsesConcern
  build_and_authorize_new_question :multiple_response_question,
                                   class: Course::Assessment::Question::MultipleResponse, only: [:new, :create]
  load_and_authorize_resource :multiple_response_question,
                              class: Course::Assessment::Question::MultipleResponse,
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]

  def new
    @multiple_response_question.grading_scheme = :any_correct if params[:multiple_choice] == 'true'
    @multiple_response_question.options.build(weight: 1) if @multiple_response_question.options.empty?
  end

  def create
    if @multiple_response_question.save
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      render 'new'
    end
  end

  def edit
    @multiple_response_question.description = helpers.format_ckeditor_rich_text(@multiple_response_question.description)
  end

  def update
    if params.key?(:multiple_choice)
      respond_to_switch_mcq_mrq_type
      return
    end

    @question_assessment.skill_ids = multiple_response_question_params[:question_assessment][:skill_ids]

    if @multiple_response_question.update(multiple_response_question_params.
                                          except(:question_assessment, :multiple_choice))
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      error = @multiple_response_question.errors.full_messages.to_sentence
      flash.now[:danger] = t('.failure', error: error)
      render 'edit'
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

  # TODO: Remove once backend is fully API only
  # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def respond_to_switch_mcq_mrq_type_html(is_mcq, unsubmit)
    @message_success_switch = if params[:multiple_choice] == 'true' && params[:unsubmit] == 'false'
                                t('.switch_mrq_success', number: @question_number)
                              elsif params[:multiple_choice] == 'true'
                                t('.switch_mrq_unsubmit_success', number: @question_number)
                              elsif params[:multiple_choice] == 'false' && params[:unsubmit] == 'false'
                                t('.switch_mcq_success', number: @question_number)
                              else
                                t('.switch_mcq_unsubmit_success', number: @question_number)
                              end

    @message_failure_switch = t('.failure')
    switch_mcq_mrq_type(is_mcq, unsubmit)

    return render 'edit' unless params.key?(:redirect_to_assessment_show) &&
                                params[:redirect_to_assessment_show] == 'true'

    redirect_to course_assessment_path(current_course, @assessment), success: @message_success_switch
  end
  # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

  def respond_to_switch_mcq_mrq_type
    is_mcq = params[:multiple_choice] == 'true'
    unsubmit = params[:unsubmit] != 'false'

    respond_to do |format|
      format.html { respond_to_switch_mcq_mrq_type_html(is_mcq, unsubmit) }

      format.json do
        if switch_mcq_mrq_type(is_mcq, unsubmit)
          render partial: 'multiple_response_details', locals: {
            assessment: @assessment,
            question: @multiple_response_question,
            new_question: false
          }
        else
          render json: { errors: @multiple_response_question.errors.full_messsages.to_sentence }, status: :bad_request
        end
      end
    end
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
    @question_number = @question_assessment.question_number
  end
end
