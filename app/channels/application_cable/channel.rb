# frozen_string_literal: true
class ApplicationCable::Channel < ActionCable::Channel::Base
  protected

  def request
    ActionDispatch::Request.new(connection.env)
  end
end
