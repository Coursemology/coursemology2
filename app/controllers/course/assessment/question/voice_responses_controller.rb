# frozen_string_literal: true
class Course::Assessment::Question::VoiceResponsesController < \
  Course::Assessment::QuestionsController
  load_and_authorize_resource :voice_response_question,
                              class: Course::Assessment::Question::VoiceResponse,
                              through: :assessment, parent: false

  def create
    if @voice_response_question.save
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      render 'new'
    end
  end

  def new
  end

  def update
    if @voice_response_question.update_attributes(voice_response_question_params)
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      render 'edit'
    end
  end

  def edit
  end

  def destroy
    if @voice_response_question.destroy
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      error = @voice_response_question.errors.full_messages.to_sentence
      redirect_to course_assessment_path(current_course, @assessment),
                  danger: t('.failure', error: error)
    end
  end

  private

  def voice_response_question_params
    params.require(:question_voice_response).permit(
      :file, :title, :description,
      :staff_only_comments, :maximum_grade, skill_ids: []
    )
  end
end
