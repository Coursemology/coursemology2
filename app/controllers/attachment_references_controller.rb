# frozen_string_literal: true
class AttachmentReferencesController < ApplicationController
  load_resource :attachment_reference

  def create
    attachment = Attachment.find_or_create_by(file: file_params[:file]) if file_params[:file]
    return unless attachment

    @attachment_reference = AttachmentReference.create(attachment: attachment, name: file_params[:name])
  end

  def show
    redirect_to @attachment_reference.url(filename: @attachment_reference.name)
  end

  def destroy
    authorize!(:destroy_attachment, @attachment_reference.attachable)

    success = @attachment_reference.class.transaction do
      answer = Course::Assessment::Answer.find(params[:answerId])
      answer.update(last_session_id: session.id, client_version: params[:clientVersion])

      raise ActiveRecord::Rollback unless @attachment_reference.destroy

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

  def file_params
    params.permit(:file, :name)
  end
end
