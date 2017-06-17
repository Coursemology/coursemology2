# frozen_string_literal: true
class AttachmentReferencesController < ApplicationController
  load_resource :attachment_reference

  def show
    redirect_to @attachment_reference.url(filename: @attachment_reference.name)
  end

  def destroy
    authorize!(:destroy_attachment, @attachment_reference.attachable)
    if @attachment_reference.destroy
      flash.now[:success] = t('.success')
    else
      flash.now[:danger] = t('.failure',
                             error: @attachment_reference.errors.full_messsages.to_sentence)
    end
  end
end
