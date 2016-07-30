# frozen_string_literal: true
class AttachmentReferencesController < ApplicationController
  load_resource :attachment_reference

  def show
    redirect_to @attachment_reference.url
  end
end
