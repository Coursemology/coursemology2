# frozen_string_literal: true
class Course::Assessment::Question::TextResponsesController < \
  Course::Assessment::QuestionsController
  load_and_authorize_resource :text_response_question,
                              class: Course::Assessment::Question::TextResponse,
                              through: :assessment, parent: false

  def new
  end

  def create
    if @text_response_question.save
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @text_response_question.update_attributes(text_response_question_params)
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      render 'edit'
    end
  end

  def destroy
    if @text_response_question.destroy
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      error = @text_response_question.errors.full_messages.to_sentence
      redirect_to course_assessment_path(current_course, @assessment),
                  danger: t('.failure', error: error)
    end
  end

  private

  def text_response_question_params
    params.require(:question_text_response).permit(
      :title, :description, :staff_only_comments, :maximum_grade, :weight, :allow_attachment,
      skill_ids: [],
      solutions_attributes: [:_destroy, :id, :solution_type, :solution, :grade, :explanation]
    )
  end
end
