# frozen_string_literal: true
class Course::LessonPlan::MilestonesController < Course::LessonPlan::Controller
  load_and_authorize_resource :milestone,
                              through: :course, through_association: :lesson_plan_milestones,
                              class: Course::LessonPlan::Milestone.name

  def create #:nodoc:
    if @milestone.save
      render partial: 'milestone', locals: { milestone: @milestone }
    else
      render json: { errors: @milestone.errors }, status: :bad_request
    end
  end

  def update #:nodoc:
    if @milestone.update_attributes(milestone_params)
      render partial: 'milestone', locals: { milestone: @milestone }
    else
      render json: { errors: @milestone.errors }, status: :bad_request
    end
  end

  def destroy #:nodoc:
    if @milestone.destroy
      head :ok
    else
      head :bad_request
    end
  end

  private

  def milestone_params #:nodoc:
    params.require(:lesson_plan_milestone).
      permit(:title, :description, :start_at)
  end
end
