# frozen_string_literal: true
class Course::Assessment::Question::TextResponsesController < \
  Course::Assessment::QuestionsController
  load_and_authorize_resource :text_response_question,
                              class: Course::Assessment::Question::TextResponse,
                              through: :assessment, parent: false

  def new
    if params[:file_upload] == 'true'
      @text_response_question.hide_text = true
      @text_response_question.allow_attachment = true
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
    @question_assessment = load_question_assessment_for(@text_response_question)
  end

  def update
    if @text_response_question.update_attributes(text_response_question_params)
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
    params.require(:question_text_response).permit(
      :title, :description, :staff_only_comments, :maximum_grade, :allow_attachment,
      :hide_text,
      skill_ids: [],
      solutions_attributes: [:_destroy, :id, :solution_type, :solution, :grade, :explanation]
    )
  end

  def question_type
    @text_response_question.question_type
  end
end
