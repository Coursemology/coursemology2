# frozen_string_literal: true
module ApplicationCableCourseConcern
  extend ActiveSupport::Concern

  included do
    before_subscribe :find_course
  end

  def find_course
    course_id = params[:course_id]
    reject unless @course ||= Course.find(course_id)
  end

  def current_course
    @course
  end

  def current_course_user
    return nil unless current_course

    @current_course_user ||= current_course.course_users.find_by(user: current_user)
  end
end
