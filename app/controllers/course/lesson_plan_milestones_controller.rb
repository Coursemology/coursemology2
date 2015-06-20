class Course::LessonPlanMilestonesController < Course::ComponentController
  load_and_authorize_resource :lesson_plan_milestone,
                              through: :course,
                              class: Course::LessonPlanMilestone.name
  add_breadcrumb :index, :course_lesson_plan_path

  def new #:nodoc:
  end

  def create #:nodoc:
    if @lesson_plan_milestone.save
      redirect_to(course_lesson_plan_path(current_course),
                  success: t('.success', title: @lesson_plan_milestone.title))
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @lesson_plan_milestone.update_attributes(lesson_plan_milestone_params)
      redirect_to(course_lesson_plan_path(current_course),
                  success: t('.success', title: @lesson_plan_milestone.title))
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
    if @lesson_plan_milestone.destroy
      redirect_to(course_lesson_plan_path(current_course),
                  success: t('.success', title: @lesson_plan_milestone.title))
    else
      redirect_to(course_lesson_plan_path(current_course), failure: t('.failure'))
    end
  end

  private

  def lesson_plan_milestone_params #:nodoc:
    params.require(:lesson_plan_milestone).
      permit(:title, :description, :start_time)
  end
end
