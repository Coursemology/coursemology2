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

    array_of_module_arrays.tap { |arr| arr.flatten! }
  end
end
