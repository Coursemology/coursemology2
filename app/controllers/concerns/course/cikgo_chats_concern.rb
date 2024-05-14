# frozen_string_literal: true
module Course::CikgoChatsConcern
  extend ActiveSupport::Concern

  def find_or_create_room(course_user)
    return unless course_user.present?

    user = course_user.user
    create_cikgo_user(user) if user.cikgo_user.nil?
    Cikgo::ChatsService.find_or_create_room(course_user)
  end

  def get_mission_control_url(course_user)
    Cikgo::ChatsService.mission_control(course_user)
  end

  private

  def create_cikgo_user(user)
    provided_user_id = Cikgo::UsersService.authenticate(user, helpers.user_image(user, url: true))
    (user.cikgo_user || user.build_cikgo_user).provided_user_id = provided_user_id
    user.cikgo_user.save!
  end
end
