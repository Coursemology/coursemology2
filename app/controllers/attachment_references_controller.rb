# frozen_string_literal: true
class AttachmentReferencesController < ApplicationController
  load_resource :attachment_reference

  def create
    attachment = Attachment.find_or_create_by(file: file_params[:file]) if file_params[:file]
    return unless attachment

    @attachment_reference = AttachmentReference.create(attachment: attachment, name: file_params[:name])
  end

  def show
    redirect_to @attachment_reference.url(filename: @attachment_reference.name), allow_other_host: true
  end

  private

  def file_params
    params.permit(:file, :name)
  end
end
