# frozen_string_literal: true
class Course::Forum::ComponentController < Course::Forum::Controller
  protected

  def add_forum_breadcrumb
    super
    add_breadcrumb @forum.name, course_forum_path(current_course, @forum)
  end
end
