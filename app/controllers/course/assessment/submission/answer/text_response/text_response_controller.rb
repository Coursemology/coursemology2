# frozen_string_literal: true
class Course::Assessment::Submission::Answer::TextResponse::TextResponseController < \
  Course::Assessment::Submission::Answer::TextResponse::Controller
  load_resource :actable, class: Course::Assessment::Answer::TextResponse.name,
                          singleton: true, through: :answer
  before_action :set_text_response_answer

  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  def upload_files
    success = @text_response_answer.class.transaction do
      raise ActiveRecord::Rollback unless update_answer_files(upload_files_params)

      true
    end

    if success
      render @text_response_answer.answer
    else
      @text_response_answer.errors.messages.each do |attribute, message|
        @text_response_answer.answer.errors.add(attribute, message)
      end
      render json: { errors: @text_response_answer.answer.errors.messages }, status: :bad_request
    end
  end

  def delete_file
    attachment_reference = AttachmentReference.find(delete_file_params[:attachmentId])
    answer = @text_response_answer.acting_as

    success = @text_response_answer.class.transaction do
      answer.update(last_session_id: session.id, client_version: delete_file_params[:clientVersion])
      raise ActiveRecord::Rollback unless attachment_reference.destroy

      true
    end

    respond_to do |format|
      format.json { render_json_response(success) }
    end
  end

  private

  def render_json_response(success)
    if success
      head :ok
    else
      head :bad_request
    end
  end

  def update_answer_files(answer_params)
    @text_response_answer.create_and_upload_files(answer_params.merge(session_id: session.id))
  end

  def upload_files_params
    params.require(:answer).permit(attachment_params, :clientVersion)
  end

  def delete_file_params
    params.permit(:attachmentId, :clientVersion)
  end
end
