# frozen_string_literal: true
class Course::Assessment::Submission::Answer::TextResponse::TextResponseController < \
  Course::Assessment::Submission::Answer::TextResponse::Controller
  load_resource :actable, class: Course::Assessment::Answer::TextResponse.name,
                          singleton: true, through: :answer
  before_action :set_text_response_answer

  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  def upload_files
    if update_answer_files(upload_files_params)
      render @text_response_answer.answer
    else
      render json: { errors: @text_response_answer.errors.messages }, status: :bad_request
    end
  end

  private

  def update_answer_files(answer_params)
    @text_response_answer.create_and_upload_files(answer_params)
  end

  def upload_files_params
    params.require(:answer).permit(attachment_params)
  end
end
