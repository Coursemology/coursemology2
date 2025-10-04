# frozen_string_literal: true
class Course::RubricsController < Course::Controller
  load_and_authorize_resource :rubric, through: :course, class: 'Course::Rubric'

  def index
    @rubrics = current_course.rubrics
  end

  def destroy
  end
end
