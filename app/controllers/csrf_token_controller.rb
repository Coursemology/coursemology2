# frozen_string_literal: true
class CsrfTokenController < ApplicationController
  def csrf_token
    render json: { csrfToken: form_authenticity_token }
  end

  protected

  def publicly_accessible?
    true
  end
end
