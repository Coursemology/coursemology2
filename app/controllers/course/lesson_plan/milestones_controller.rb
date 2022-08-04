# frozen_string_literal: true
class Course::LessonPlan::MilestonesController < Course::LessonPlan::Controller
  include Course::LessonPlan::ActsAsLessonPlanItemConcern

  build_and_authorize_new_lesson_plan_item :milestone,
                                           through: :course, through_association: :lesson_plan_milestones,
                                           class: Course::LessonPlan::Milestone, only: [:new, :create]
  load_and_authorize_resource :milestone,
                              through: :course, through_association: :lesson_plan_milestones,
                              class: Course::LessonPlan::Milestone.name, except: [:new, :create]

  def create
    if @milestone.save
      render partial: 'milestone', locals: { milestone: @milestone }
    else
      render json: { errors: @milestone.errors }, status: :bad_request
    end
  end

  def update
    if @milestone.update(milestone_params)
      render partial: 'milestone', locals: { milestone: @milestone }
    else
      render json: { errors: @milestone.errors }, status: :bad_request
    end
  end

  def destroy
    if @milestone.destroy
      head :ok
    else
      head :bad_request
    end
  end

  private

  def milestone_params
    params.require(:lesson_plan_milestone).
      permit(:title, :description, :start_at)
  end
end
