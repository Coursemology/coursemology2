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
    end
    return unless params[:comprehension] == 'true'

    @text_response_question.is_comprehension = true
    @text_response_question.build_at_least_one_group_one_point
  end

  def create
    if @text_response_question.save
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @text_response_question.errors }, status: :bad_request
    end
  end

  def edit
    @text_response_question.description = helpers.format_ckeditor_rich_text(@text_response_question.description)
    # The explanation field uses the Summernote editor so it needs sanitization.
    @text_response_question.solutions.each do |sol|
      sol.explanation = helpers.format_ckeditor_rich_text(sol.explanation)
    end
    @text_response_question.build_at_least_one_group_one_point if @text_response_question.comprehension_question?
  end

  def update
    update_skill_ids_if_params_present(text_response_question_params[:question_assessment])

    if update_text_response_question
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @text_response_question.errors }, status: :bad_request
    end
  end

  def destroy
    if @text_response_question.destroy
      head :ok
    else
      error = @text_response_question.errors.full_messages.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  private

  def update_text_response_question
    @text_response_question.update(
      text_response_question_params.except(:question_assessment)
    )
  end

  def text_response_question_params
    permitted_params = [
      :title, :description, :staff_only_comments, :maximum_grade, :attachment_type,
      :hide_text, :is_comprehension, :require_attachment,
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

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@text_response_question)
  end
end
