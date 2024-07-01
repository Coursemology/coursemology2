# frozen_string_literal: true
class Course::Assessment::Submission::Answer::TextResponse::TextResponseController < \
  Course::Assessment::Submission::Answer::TextResponse::Controller
  load_resource :actable, class: 'Course::Assessment::Answer::TextResponse',
                          singleton: true, through: :answer
  before_action :set_text_response_answer

  def create_files
    authorize! :update, @text_response_answer.answer

    @text_response_answer.assign_params(create_files_params)

    if @text_response_answer.answer.save
      render @text_response_answer.answer
    else
      render json: { errors: @text_response_answer.errors }, status: :bad_request
    end
  end

  def delete_file
    authorize! :destroy_attachment, @text_response_answer

    attachment_reference = @text_response_answer.attachments.find(delete_file_params[:attachment_id])

    if attachment_reference.destroy
      render @text_response_answer.answer
    else
      render json: { errors: @text_response_answer.errors }, status: :bad_request
    end
  end

  private

  def create_files_params
    params.require(:answer).permit(attachment_params)
  end

  def delete_file_params
    params.permit(:attachment_id)
  end
end
