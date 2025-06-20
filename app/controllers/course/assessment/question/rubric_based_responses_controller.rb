# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponsesController < Course::Assessment::Question::Controller
  include Course::Assessment::Question::RubricBasedResponseQuestionConcern
  include Course::Assessment::Question::RubricBasedResponseControllerConcern

  build_and_authorize_new_question :rubric_based_response_question,
                                   class: Course::Assessment::Question::RubricBasedResponse, only: [:new, :create]
  load_and_authorize_resource :rubric_based_response_question,
                              class: 'Course::Assessment::Question::RubricBasedResponse',
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]
  before_action :preload_criterions_per_category, only: [:edit]

  RESERVED_CATEGORY_NAMES = Course::Assessment::Question::RubricBasedResponse::RESERVED_CATEGORY_NAMES

  def create
    if @rubric_based_response_question.save
      success = add_bonus_category_to_rubric_based_question

      if success
        render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
      else
        head :bad_request
      end
    else
      render json: { errors: @rubric_based_response_question.errors.messages.values.flatten.to_sentence },
             status: :bad_request
    end
  end

  def edit
    @rubric_based_response_question.description = helpers.format_ckeditor_rich_text(
      @rubric_based_response_question.description
    )

    @rubric_based_response_question.categories.without_bonus_category.each do |category|
      category.criterions.each do |grade|
        grade.explanation = helpers.format_ckeditor_rich_text(grade.explanation)
      end
    end
  end

  def update
    update_skill_ids_if_params_present(rubric_based_response_question_params[:question_assessment])

    if update_rubric_based_response_question
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @rubric_based_response_question.errors.messages.values.flatten.to_sentence },
             status: :bad_request
    end
  end

  def destroy
    if @rubric_based_response_question.destroy
      super

      head :ok
    else
      error = @rubric_based_response_question.errors.messages.values.flatten.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  private

  def add_bonus_category_to_rubric_based_question
    bonus_category_objects = RESERVED_CATEGORY_NAMES.map do |name|
      {
        question_id: @rubric_based_response_question.id,
        name: name.titleize,
        is_bonus_category: true
      }
    end

    ActiveRecord::Base.transaction do
      bonus_categories = Course::Assessment::Question::RubricBasedResponseCategory.insert_all(bonus_category_objects)
      if !bonus_categories.empty? && (bonus_categories.nil? || bonus_categories.rows.empty?)
        raise ActiveRecord::Rollback
      end

      true
    end
  end

  def update_rubric_based_response_question
    ActiveRecord::Base.transaction do
      existing_category_ids = @rubric_based_response_question.categories.pluck(:id)
      raise ActiveRecord::Rollback unless @rubric_based_response_question.update(
        rubric_based_response_question_params.except(:question_assessment)
      )

      new_category_ids = @rubric_based_response_question.reload.categories.pluck(:id) - existing_category_ids
      create_new_category_grade_instances(new_category_ids) if new_category_ids.present?
      update_all_submission_answer_grades
    end
  end

  def rubric_based_response_question_params
    permitted_params = [
      :title, :description, :staff_only_comments, :maximum_grade, :ai_grading_enabled, :ai_grading_custom_prompt,
      question_assessment: { skill_ids: [] },
      categories_attributes: [:_destroy, :id, :name,
                              criterions_attributes: [:_destroy, :id, :grade, :explanation]]
    ]

    params.require(:question_rubric_based_response).permit(*permitted_params)
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@rubric_based_response_question)
  end
end
