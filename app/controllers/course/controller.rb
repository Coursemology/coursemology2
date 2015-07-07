class Course::Controller < ApplicationController
  load_and_authorize_resource :course

  before_action :add_course_breadcrumb

  # Gets the sidebar items. The sidebar items are ordered by the settings of current course.
  #
  # @param [Symbol] type The type of sidebar item, all sidebar items will be returned if the type
  # is not specified.
  # @return [Array] The array of ordered sidebar items of the given type.
  def sidebar_items(type: nil)
    sidebar_items = current_component_host.sidebar_items
    sidebar_items = sidebar_items.select { |item| item.fetch(:type, :normal) == type } if type
    sidebar_settings = Course::Settings::Sidebar.new(current_course.settings, sidebar_items)
    weights_hash = sidebar_settings.sidebar_items.map { |item| [item.id, item.weight] }.to_h
    sidebar_items.sort_by { |item| weights_hash[item[:key]] }
  end

  def settings
    @current_component_host_settings ||=
      current_component_host.settings.sort_by { |item| item[:weight] }
  end

  # Gets the current course.
  # @return [Course] The current course that the user is browsing.
  def current_course
    @course
  end
  helper_method :current_course

  # Gets the current course user.
  # @return [CourseUser|nil] The course user that belongs to the signed in user and the loaded
  #   course. nil if there is no user session, or no course is loaded.
  def current_course_user
    @current_course_user ||= @course.course_users.find_by(user: current_user)
  end
  helper_method :current_course_user

  # Gets the component host for current instance and course
  #
  # @return [Course::ComponentHost] The instance of component host using settings from instance and
  #   course
  def current_component_host
    @current_component_host ||= Course::ComponentHost.new(current_tenant.settings(:components),
                                                          current_course.settings(:components),
                                                          self)
  end

  private

  def add_course_breadcrumb
    add_breadcrumb(current_course.title, course_path(current_course)) if
      current_course.present? && current_course.id.present?
  end
end
