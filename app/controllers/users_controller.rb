# frozen_string_literal: true
class UsersController < ApplicationController
  load_resource :user

  def show
    if @user.built_in?
      head :not_found
    else
      course_users = @user.course_users.with_course_statistics.from_instance(current_tenant)
      @current_courses = course_users.merge(Course.current).order(created_at: :desc)
      @completed_courses = course_users.merge(Course.completed).order(created_at: :desc)
      @instances = other_instances
    end
  end

  private

  def other_instances
    tenant = current_tenant
    ActsAsTenant.without_tenant { Instance.containing_user(@user) - [tenant] }
  end
end
