# frozen_string_literal: true
class AttachmentReferencesController < ApplicationController
  load_resource :attachment_reference

  def create
    attachment = Attachment.find_or_create_by(file: file_params[:file]) if file_params[:file]
    return unless attachment

    @attachment_reference = AttachmentReference.create(attachment: attachment, name: file_params[:name])
  end

  def show
    name = @attachment_reference.name
    uploader = @attachment_reference.attachment.file_upload

    # if case is only for local storage, since there is no S3 URL to redirect to. In prod, it always goes to else.
    if uploader.class.storage == CarrierWave::Storage::File # under Dev/test, config.storage = :file
      raise ActiveRecord::RecordNotFound, "File not found at path: #{uploader.path}" unless uploader.file&.exists?

      send_file uploader.path,
                filename: name,
                type: uploader.content_type
    else
      redirect_to @attachment_reference.url(filename: name), allow_other_host: true
    end
  end

  private

  def file_params
    params.permit(:file, :name)
  end
end
