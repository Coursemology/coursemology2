# frozen_string_literal: true
class Course::Assessment::Question::TextResponsesController < Course::Assessment::Question::Controller
  build_and_authorize_new_question :text_response_question,
                                   class: Course::Assessment::Question::TextResponse, only: [:new, :create]
  load_and_authorize_resource :text_response_question,
                              class: Course::Assessment::Question::TextResponse,
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]

  def new
    if params[:file_upload] == 'true'
      @text_response_question.hide_text = true
      @text_response_question.allow_attachment = true
    end
    if params[:comprehension] == 'true'
      @text_response_question.is_comprehension = true
      @text_response_question.build_at_least_one_group_one_point
    end
  end

  def create
    if @text_response_question.save
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success', name: question_type)
    else
      render 'new'
    end
  end

  def edit
    @text_response_question.description = helpers.format_html(@text_response_question.description)
    @text_response_question.build_at_least_one_group_one_point if @text_response_question.comprehension_question?
  end

  def update
    @question_assessment.skill_ids = text_response_question_params[:question_assessment][:skill_ids]
    if @text_response_question.update(text_response_question_params.except(:question_assessment))
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success', name: question_type)
    else
      render 'edit'
    end
  end

  def destroy
    title = question_type
    if @text_response_question.destroy
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success', name: title)
    else
      error = @text_response_question.errors.full_messages.to_sentence
      redirect_to course_assessment_path(current_course, @assessment),
                  danger: t('.failure', name: title, error: error)
    end
  end

  private

  def text_response_question_params
    permitted_params = [
      :title, :description, :staff_only_comments, :maximum_grade, :allow_attachment,
      :hide_text, :is_comprehension,
      question_assessment: { skill_ids: [] }
    ]
    if params[:question_text_response][:is_comprehension] == 'true'
      permitted_params.concat(
        [
          groups_attributes:
          [
            :_destroy, :id, :maximum_group_grade,
            points_attributes:
            [
              :_destroy, :id, :point_grade,
              solutions_attributes:
              [
                :_destroy, :id, :solution_type, :information, solution: []
              ]
            ]
          ]
        ]
      )
    else
      permitted_params.concat(
        [solutions_attributes: [:_destroy, :id, :solution_type, :solution, :grade, :explanation]]
      )
    end
    params.require(:question_text_response).permit(*permitted_params)
  end

  def question_type
    @text_response_question.question_type
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@text_response_question)
  end
end
