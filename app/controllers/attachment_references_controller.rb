# frozen_string_literal: true
class AttachmentReferencesController < ApplicationController
  load_resource :attachment_reference
  before_action :authorize_resource

  def show
    redirect_to @attachment_reference.url
  end

  private

  def authorize_resource
    authorize!(:read, @attachment_reference.attachable)
  end
end
