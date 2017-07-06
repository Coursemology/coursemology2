# frozen_string_literal: true
class AttachmentReferencesController < ApplicationController
  load_resource :attachment_reference

  def show
    redirect_to @attachment_reference.url(filename: @attachment_reference.name)
  end

  def destroy
    authorize!(:destroy_attachment, @attachment_reference.attachable)

    success = @attachment_reference.destroy

    respond_to do |format|
      format.html { render_html_response(success) }
      format.json { render_json_response(success) }
    end
  end

  private

  def render_html_response(success)
    if success
      flash.now[:success] = t('.success')
    else
      flash.now[:danger] = t('.failure',
                             error: @attachment_reference.errors.full_messsages.to_sentence)
    end
  end

  def render_json_response(success)
    if success
      head :ok
    else
      head :bad_request
    end
  end
end
