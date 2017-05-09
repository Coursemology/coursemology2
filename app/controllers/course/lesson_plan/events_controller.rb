# frozen_string_literal: true
class Course::LessonPlan::EventsController < Course::LessonPlan::Controller
  load_and_authorize_resource :event, class: Course::LessonPlan::Event.name, through: :course,
                                      through_association: :lesson_plan_events

  def new #:nodoc:
  end

  def create #:nodoc:
    if @event.save
      redirect_to course_lesson_plan_path(current_course),
                  success: t('.success', title: @event.title)
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @event.update_attributes(event_params)
      redirect_to course_lesson_plan_path(current_course),
                  success: t('.success', title: @event.title)
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
    if @event.destroy
      redirect_to course_lesson_plan_path(current_course),
                  success: t('.success', title: @event.title)
    else
      redirect_to course_lesson_plan_path(current_course),
                  failure: t('.failure')
    end
  end

  private

  def event_params #:nodoc:
    params.require(:lesson_plan_event).
      permit(:event_type, :title, :description, :location, :start_at, :end_at, :published)
  end
end
