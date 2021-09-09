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
    @multiple_response_question.description = helpers.format_html(@multiple_response_question.description)
  end

  def update
    @question_assessment.skill_ids = multiple_response_question_params[:question_assessment][:skill_ids]
    if params.has_key?(:multiple_choice)
      switch_mcq_mrq_type(params[:multiple_choice]) 
      return render 'edit'
    end

    if @multiple_response_question.update(multiple_response_question_params.
                                          except(:question_assessment, :multiple_choice))
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
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
      :randomize_options, question_assessment: { skill_ids: [] },
                          options_attributes: [:_destroy, :id, :correct, :option,
                                               :explanation, :weight, :ignore_randomization]
    )
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@multiple_response_question)
  end
end
