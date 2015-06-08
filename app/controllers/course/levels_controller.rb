class Course::LevelsController < Course::ComponentController
  before_action :number_levels, only: [:index]
  load_and_authorize_resource

  def index #:nodoc:
  end

  private

  # This methods ensures that the Course::Levels are numbered
  # for use by the controller.
  def number_levels
    @levels = @course.numbered_levels
  end
end
