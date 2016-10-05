class Course::DuplicationsController < Course::ComponentController
  def show
  end

  def create
    redirect_to course_duplication_path(current_course), success: t('.duplicating')
  end
end
