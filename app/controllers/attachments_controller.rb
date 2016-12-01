# frozen_string_literal: true
class AttachmentsController < ApplicationController
  def create
    @attachment = Attachment.find_or_create_by(file: file_params[:file]) if file_params[:file]
  end

  private

  def file_params
    params.permit(:file)
  end
end
