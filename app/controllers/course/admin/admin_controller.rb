# frozen_string_literal: true
class Course::Admin::AdminController < Course::Admin::Controller
  def index
  end

  def update #:nodoc:
    if current_course.update_attributes(course_setting_params)
      redirect_to course_admin_path(current_course),
                  success: t('.success', title: current_course.title)
    else
      render 'index'
    end
  end

  def destroy #:nodoc:
    if current_course.destroy
      destroy_success
    else
      destroy_failure
    end
  end

  private

  def course_setting_params #:nodoc:
    params.require(:course).
      permit(:title, :description, :published, :enrollable, :start_at, :end_at, :logo, :gamified,
             :time_zone, :advance_start_at_duration_days)
  end

  def destroy_success #:nodoc:
    redirect_to courses_path,
                success: t('course.admin.admin.destroy.success',
                           title: current_course.title)
  end

  def destroy_failure #:nodoc:
    redirect_to course_admin_path(current_course),
                danger: t('course.admin.admin.destroy.failure',
                          error: current_course.errors.full_messages.to_sentence)
  end
end
