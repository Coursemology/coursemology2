# frozen_string_literal: true
class ApplicationCable::Channel < ActionCable::Channel::Base
  include ApplicationCableMultitenancyConcern

  protected

  def request
    ActionDispatch::Request.new(connection.env)
  end

  def ip_address_and_user_agent
    ip_address = request.remote_ip
    user_agent = request.headers['User-Agent']
    [ip_address, user_agent]
  end
end
