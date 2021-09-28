# frozen_string_literal: true
class Course::LessonPlan::EventsController < Course::LessonPlan::Controller
  include Course::LessonPlan::ActsAsLessonPlanItemConcern

  build_and_authorize_new_lesson_plan_item :event, class: Course::LessonPlan::Event, through: :course,
                                                   through_association: :lesson_plan_events, only: [:new, :create]
  load_and_authorize_resource :event, class: Course::LessonPlan::Event.name, through: :course,
                                      through_association: :lesson_plan_events, except: [:new, :create]

  def create #:nodoc:
    if @event.save
      render partial: 'event_lesson_plan_item', locals: { item: @event }
    else
      render json: { errors: @event.errors }, status: :bad_request
    end
  end

  def update #:nodoc:
    if @event.update(event_params)
      render partial: 'event_lesson_plan_item', locals: { item: @event }
    else
      render json: { errors: @event.errors }, status: :bad_request
    end
  end

  def destroy #:nodoc:
    if @event.destroy
      head :ok
    else
      head :bad_request
    end
  end

  private

  def event_params #:nodoc:
    params.require(:lesson_plan_event).
      permit(:event_type, :title, :description, :location, :start_at, :end_at, :published)
  end
end
