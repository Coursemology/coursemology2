# frozen_string_literal: true
class Course::PersonalTimesController < Course::ComponentController
  include Course::LessonPlan::PersonalizationConcern

  before_action :authorize_personal_times!

  def index
    if params[:user_id].present?
      @course_user = CourseUser.find_by(course: @course, id: params[:user_id])

      # Only show for assessments and videos
      @items = @course.lesson_plan_items.where(actable_type: [Course::Assessment.name, Course::Video.name]).
               ordered_by_date_and_title.
               with_reference_times_for(@course_user).
               with_personal_times_for(@course_user)

      @learning_rate = compute_learning_rate_ema(@course_user, @items,
                                                 lesson_plan_items_submission_time_hash(@course_user))

      submissions = lesson_plan_items_submission_time_hash(@course_user)
      items = @course_user.course.lesson_plan_items.published.
              with_reference_times_for(@course_user).
              with_personal_times_for(@course_user).
              to_a
      items = items.sort_by { |x| x.time_for(@course_user).start_at }
      if items.any?
        @learning_rate_limits = compute_learning_rate_effective_limits(@course_user, items, submissions, 0.5, 2)
      end
    end

    render 'index'
  end

  def create
    @course_user = CourseUser.find_by(course: @course, id: params[:user_id])
    @item = @course.lesson_plan_items.find(params[:personal_time][:lesson_plan_item_id])
    @personal_time = @item.find_or_create_personal_time_for(@course_user)
    if @personal_time.update(personal_time_params)
      redirect_to course_user_personal_times_path, success: t('.success')
    else
      redirect_to course_user_personal_times_path, danger: @personal_time.errors.full_messages.to_sentence
    end
  end

  def destroy
    @course_user = CourseUser.find_by(course: @course, id: params[:user_id])
    @personal_time = @course_user.personal_times.find(params[:id])
    if @personal_time.destroy
      redirect_to course_user_personal_times_path, success: t('.success')
    else
      redirect_to course_user_personal_times_path, danger: @personal_time.errors.full_messages.to_sentence
    end
  end

  def recompute
    @course_user = CourseUser.find_by(course: @course, id: params[:user_id])
    update_personalized_timeline_for(@course_user) if @course_user.present?
    redirect_to course_user_personal_times_path, success: t('.success', name: @course_user.name)
  end

  private

  def component
    current_component_host[:course_users_component]
  end

  def authorize_personal_times!
    authorize!(:manage_personal_times, current_course)
  end

  def personal_time_params
    params[:personal_time].permit(:start_at, :bonus_end_at, :end_at, :fixed)
  end
end
