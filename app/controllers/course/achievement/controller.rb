# frozen_string_literal: true
class Course::Achievement::Controller < Course::ComponentController
  load_and_authorize_resource :achievement, through: :course, class: Course::Achievement.name
  add_breadcrumb :index, :course_achievements_path

  helper name
end
