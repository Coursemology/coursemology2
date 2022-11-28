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
      switch_mcq_mrq_type(params[:multiple_choice], params[:unsubmit])

      return render 'edit' unless params.key?(:redirect_to_assessment_show) &&
                                  params[:redirect_to_assessment_show] == 'true'

      return redirect_to course_assessment_path(current_course, @assessment),
                         success: @message_success_switch
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
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      error = @multiple_response_question.errors.full_messages.to_sentence
      redirect_to course_assessment_path(current_course, @assessment),
                  danger: t('.failure', error: error)
    end
  end

  private

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
