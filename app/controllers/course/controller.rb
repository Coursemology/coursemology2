class Course::Controller < ApplicationController
  load_and_authorize_resource :course

  def sidebar
    Course::CoursesController.modules.map { |module_| module_.sidebar }
  end
end
