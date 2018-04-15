# frozen_string_literal: true
class Course::Controller < ApplicationController
  load_and_authorize_resource :course
  before_action :set_last_active_at
  helper name

  before_action :add_course_breadcrumb

  # Gets the sidebar items. The sidebar items are ordered by the settings of current course.
  #
  # @param [Symbol] type The type of sidebar item, all sidebar items will be returned if the type
  # is not specified.
  # @return [Array] The array of ordered sidebar items of the given type.
  def sidebar_items(type: nil)
    weights_hash = sidebar_items_weights
    items = sidebar_items_of_type(type)

    items.sort do |a, b|
      weight_a = weights_hash[a[:key]] || a[:weight]
      weight_b = weights_hash[b[:key]] || b[:weight]
      (weight_a <=> weight_b).nonzero? || a[:key].to_s <=> b[:key].to_s
    end
  end

  # Fetches the first unread popup `UserNotification` for the current course and returns JSON data
  # for the frontend to display it.
  #
  # @return [String] JSON data for the next notification, if there is one.
  # @return [nil] if there are no unread notifications, or no +current_course_user+.
  def next_popup_notification
    return unless current_course_user
    notification = UserNotification.next_unread_popup_for(current_course_user)
    notification && render_to_string("#{helpers.notification_view_path(notification)}.json",
                                     locals: { notification: notification })
  end

  # Gets the current course.
  # @return [Course] The current course that the user is browsing.
  def current_course
    @course
  end
  helper_method :current_course

  # Gets the current course user.
  # @return [CourseUser] The course user that belongs to the signed in user and the loaded
  #   course.
  # @return [nil] If there is no user session, or no course is loaded.
  def current_course_user
    return nil unless current_course

    @current_course_user ||= current_course.course_users.with_course_statistics.
                             find_by(user: current_user)
  end
  helper_method :current_course_user

  # Gets the component host for current instance and course
  #
  # @return [Course::ControllerComponentHost] The instance of component host using settings from
  #   instance and course
  def current_component_host
    @current_component_host ||=
      Course::ControllerComponentHost.new(current_tenant.settings(:components),
                                          current_course.settings(:components), self)
  end
  helper_method :current_component_host

  # Override of Cancancan#current_ability to provide current course.
  def current_ability
    @current_ability ||= Ability.new(current_user, current_course, current_course_user, session)
  end

  private

  # Selects sidebar items of the given type.
  #
  # @param [nil|Symbol] type The type of sidebar items to return. This can be nil to retrieve all
  #   items.
  # @return [Array<Hash>]
  def sidebar_items_of_type(type)
    sidebar_items = current_component_host.sidebar_items
    type ? sidebar_items.select { |item| item.fetch(:type, :normal) == type } : sidebar_items
  end

  # Computes a hash containing the key of each sidebar item, and its defined weight as the value.
  #
  # @return [Hash{Symbol=>Integer}]
  def sidebar_items_weights
    sidebar_settings = Course::Settings::Sidebar.new(current_course.settings,
                                                     current_component_host.sidebar_items)
    defined_sidebar_settings = sidebar_settings.sidebar_items.select { |item| item.id.present? }
    defined_sidebar_settings.map { |item| [item.id, item.weight] }.to_h
  end

  def add_course_breadcrumb
    add_breadcrumb(current_course.title, course_path(current_course)) if
      current_course.present? && current_course.id.present?
  end

  def set_last_active_at
    return if current_course.nil? || current_course_user.nil?

    # Only update the timestamp every hour
    return if current_course_user.last_active_at && current_course_user.last_active_at > 1.hour.ago

    current_course_user.update_column(:last_active_at, Time.zone.now)
  end
end
