# frozen_string_literal: true
module ApplicationInstanceUserConcern
  extend ActiveSupport::Concern

  included do
    before_action :track_instance_user
  end

  def current_instance_user
    return nil unless current_user

    @current_instance_user ||= current_tenant.instance_users.find_by(user: current_user)
  end

  private

  def track_instance_user
    return if current_instance_user.nil?

    # Only update the timestamp every hour
    return if current_instance_user.last_active_at && current_instance_user.last_active_at > 1.hour.ago

    current_instance_user.update_column(:last_active_at, Time.zone.now)
  end
end
