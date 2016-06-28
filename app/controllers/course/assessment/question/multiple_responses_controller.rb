# frozen_string_literal: true
class Course::Assessment::Question::MultipleResponsesController < \
  Course::Assessment::QuestionsController
  load_and_authorize_resource :multiple_response_question,
                              class: Course::Assessment::Question::MultipleResponse,
                              through: :assessment, parent: false

  def new
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
  end

  def update
    if @multiple_response_question.update_attributes(multiple_response_question_params)
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
      :title, :description, :staff_only_comments, :maximum_grade, :weight, :question_type,
      skill_ids: [],
      options_attributes: [:_destroy, :id, :correct, :option, :explanation]
    )
  end
end
