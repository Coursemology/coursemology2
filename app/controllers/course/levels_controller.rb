class Course::LevelsController < Course::ComponentController
  before_action :number_levels, only: [:index]
  load_and_authorize_resource :level, through: :course, class: Course::Level.name

  def index #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @level.save
      redirect_to(course_levels_path(current_course),
                  success: t('.success', threshold: @level.experience_points_threshold))
    else
      render 'new'
    end
  end

  private

  # This methods ensures that the Course::Levels are numbered
  # for use by the controller.
  def number_levels
    @levels = @course.numbered_levels
  end

  def level_params #:nodoc:
    params.require(:course_level).permit(:experience_points_threshold)
  end
end
