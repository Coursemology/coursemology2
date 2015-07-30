class Course::LessonPlan::MilestonesController < Course::ComponentController
  load_and_authorize_resource :milestone,
                              through: :course, through_association: :lesson_plan_milestones,
                              class: Course::LessonPlan::Milestone.name
  add_breadcrumb :index, :course_lesson_plan_path

  def new #:nodoc:
  end

  def create #:nodoc:
    if @milestone.save
      redirect_to(course_lesson_plan_path(current_course),
                  success: t('.success', title: @milestone.title))
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @milestone.update_attributes(milestone_params)
      redirect_to(course_lesson_plan_path(current_course),
                  success: t('.success', title: @milestone.title))
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
    if @milestone.destroy
      redirect_to(course_lesson_plan_path(current_course),
                  success: t('.success', title: @milestone.title))
    else
      redirect_to(course_lesson_plan_path(current_course), failure: t('.failure'))
    end
  end

  private

  def milestone_params #:nodoc:
    params.require(:lesson_plan_milestone).
      permit(:title, :description, :start_at)
  end
end
