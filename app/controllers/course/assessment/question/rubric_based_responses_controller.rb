# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponsesController < Course::Assessment::Question::Controller
  build_and_authorize_new_question :rubric_based_response_question,
                                   class: Course::Assessment::Question::RubricBasedResponse, only: [:new, :create]
  load_and_authorize_resource :rubric_based_response_question,
                              class: 'Course::Assessment::Question::RubricBasedResponse',
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]

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
      category.levels.each do |level|
        level.explanation = helpers.format_ckeditor_rich_text(level.explanation)
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
    bonus_category = Course::Assessment::Question::RubricBasedResponseCategory.new({
      question: @rubric_based_response_question,
      name: 'bonus',
      maximum_score: 0,
      is_bonus_category: true
    })

    ActiveRecord::Base.transaction do
      raise ActiveRecord::Rollback unless bonus_category.save

      true
    end
  end

  def update_rubric_based_response_question
    @rubric_based_response_question.update(
      rubric_based_response_question_params.except(:question_assessment)
    )
  end

  def rubric_based_response_question_params
    permitted_params = [
      :title, :description, :staff_only_comments, :maximum_grade,
      question_assessment: { skill_ids: [] },
      categories_attributes: [:_destroy, :id, :name, :maximum_score,
                              levels_attributes: [:_destroy, :id, :level, :explanation]]
    ]

    params.require(:question_rubric_based_response).permit(*permitted_params)
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@rubric_based_response_question)
  end
end
