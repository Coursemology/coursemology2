# frozen_string_literal: true
class Course::LessonPlan::MilestonesController < Course::LessonPlan::Controller
  load_and_authorize_resource :milestone,
                              through: :course, through_association: :lesson_plan_milestones,
                              class: Course::LessonPlan::Milestone.name

  def new #:nodoc:
  end

  def create #:nodoc:
    if @milestone.save
      redirect_to course_lesson_plan_path(current_course),
                  success: t('.success', title: @milestone.title)
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    respond_to do |format|
      format.html { render_update_html_response }
      format.json { render_update_json_response }
    end
  end

  def destroy #:nodoc:
    if @milestone.destroy
      redirect_to course_lesson_plan_path(current_course),
                  success: t('.success', title: @milestone.title)
    else
      redirect_to course_lesson_plan_path(current_course), failure: t('.failure')
    end
  end

  private

  def milestone_params #:nodoc:
    params.require(:lesson_plan_milestone).
      permit(:title, :description, :start_at)
  end

  def render_update_html_response
    if @milestone.update_attributes(milestone_params)
      redirect_to course_lesson_plan_path(current_course),
                  success: t('course.lesson_plan.milestones.update.success',
                             title: @milestone.title)
    else
      render 'edit'
    end
  end

  def render_update_json_response
    if @milestone.update_attributes(milestone_params)
      head :ok
    else
      head :bad_request
    end
  end
end
