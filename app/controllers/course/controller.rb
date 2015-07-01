class Course::Controller < ApplicationController
  load_and_authorize_resource :course

  before_action :add_course_breadcrumb

  # Gets the sidebar elements.
  #
  # Sidebar elements have the given format:
  #
  #   {
  #      title: 'Sidebar Item Title'
  #      type: :admin # Will be considered as `:normal` if not set
  #      weight: 100
  #      path: path_to_the_component
  #      unread: 0 # or nil
  #   }
  #
  # The elements are rendered on all Course controller subclasses as part of a nested template.
  # @param [Symbol] type The type of sidebar item, all sidebar items will be returned if the type
  # is not specified
  # @return [Array] The array of sidebar items of the given type
  def sidebar(type = nil)
    @sidebar ||= begin
      array_of_component_arrays = current_component_host.components.map do |component|
        component.get_sidebar_items(self)
      end

      array_of_component_arrays.tap(&:flatten!).sort_by { |item| item[:weight] }
    end

    type ? @sidebar.select { |item| (item[:type] || :normal) ==  type } : @sidebar
  end

  # Gets the settings items.
  #
  # Settings elements have the given format:
  #
  #   {
  #      title: 'Settings Item Title'
  #      controller: controller name, String or Symbol
  #      action: action name, String or Symbol
  #   }
  def settings
    array_of_component_arrays = current_component_host.components.map do |component|
      component.get_settings_items(self)
    end

    array_of_component_arrays.tap(&:flatten!)
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
                                                          current_course.settings(:components))
  end

  private

  def add_course_breadcrumb
    add_breadcrumb(current_course.title, course_path(current_course)) if
      current_course.present? && current_course.id.present?
  end
end
