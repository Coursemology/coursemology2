# frozen_string_literal: true
class Test::Controller < ActionController::Base
  before_action :restrict_to_test

  private

  def restrict_to_test
    head :not_found unless Rails.env.test?
  end
end
