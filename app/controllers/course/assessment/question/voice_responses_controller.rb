# frozen_string_literal: true
class Course::Assessment::Question::VoiceResponsesController < Course::Assessment::Question::Controller
  build_and_authorize_new_question :voice_response_question,
                                   class: Course::Assessment::Question::VoiceResponse, only: [:new, :create]
  load_and_authorize_resource :voice_response_question,
                              class: 'Course::Assessment::Question::VoiceResponse',
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]

  def create
    if @voice_response_question.save
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @voice_response_question.errors }, status: :bad_request
    end
  end

  def new
  end

  def update
    update_skill_ids_if_params_present(voice_response_question_params[:question_assessment])

    if update_voice_response_question
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @voice_response_question.errors }, status: :bad_request
    end
  end

  def edit
  end

  def destroy
    if @voice_response_question.destroy
      head :ok
    else
      error = @voice_response_question.errors.full_messages.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  private

  def update_voice_response_question
    @voice_response_question.update(voice_response_question_params.except(:question_assessment))
  end

  def voice_response_question_params
    params.require(:question_voice_response).permit(
      :title, :description,
      :staff_only_comments, :maximum_grade,
      question_assessment: { skill_ids: [] }
    )
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@voice_response_question)
  end
end
