class Course::AchievementsController < Course::ModuleController
  load_and_authorize_resource :achievement, through: :course, class: Course::Achievement.name

  def index #:nodoc:
  end
end
