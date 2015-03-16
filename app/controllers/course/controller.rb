class Course::Controller < ApplicationController
  load_and_authorize_resource :course

  # Gets the sidebar elements.
  #
  # Sidebar elements have the given format:
  #
  # ```
  # {
  #    title: 'Sidebar Item Title'
  #    unread: 0 # or nil
  # }
  # ```
  #
  # The elements are rendered on all Course controller subclasses as part of a nested template.
  def sidebar
    array_of_module_arrays = Course::CoursesController.modules.map do |module_|
      module_.get_sidebar_items(self)
    end

    array_of_module_arrays.tap(&:flatten!)
  end

  # Gets the current course.
  # @return [CourseUser] The course user that belongs to the signed in user and the loaded course.
  #                      Or nil if there is no user session or no course is loaded.
  def current_course_user
    if current_user && @course
      @current_course_user = CourseUser.find_by_user_id_and_course_id(
        current_user.id,
        @course.id
      )
    end
    @current_course_user
  end

  # Gets the settings items.
  #
  # Settings elements have the given format:
  #
  # ```
  # {
  #    title: 'Settings Item Title'
  #    controller: controller name, String or Symbol
  #    action: action name, String or Symbol
  # }
  # ```
  def settings
    array_of_module_arrays = Course::CoursesController.modules.map do |module_|
      module_.get_settings_items(self)
    end

    array_of_module_arrays.tap(&:flatten!)
  end
end
