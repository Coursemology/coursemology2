# frozen_string_literal: true
class Course::LevelsController < Course::ComponentController
  load_and_authorize_resource :level, through: :course, class: Course::Level.name
  add_breadcrumb :index, :course_levels_path

  def index #:nodoc:
    @levels = @course.levels
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @level.save
      redirect_to course_levels_path(current_course),
                  success: t('.success', threshold: @level.experience_points_threshold)
    else
      render 'new'
    end
  end

  def destroy #:nodoc:
    if @level.destroy
      redirect_to course_levels_path(current_course),
                  success: t('.success',
                             threshold: @level.experience_points_threshold)
    else
      redirect_to course_levels_path(current_course),
                  danger: t('.failure', error: @level.errors.full_messages.to_sentence)
    end
  end

  private

  def level_params #:nodoc:
    params.require(:level).permit(:experience_points_threshold)
  end
end
