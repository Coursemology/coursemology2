# frozen_string_literal: true
class UsersController < ApplicationController
  around_action :unscope_resources
  load_resource :user

  def show
    @course_users = @user.course_users
    @current_course_users = @course_users.from_instance(current_tenant).merge(Course.current)
    @completed_course_users = @course_users.from_instance(current_tenant).merge(Course.completed)
    @instances = other_instances
  end

  private

  def unscope_resources
    Course.unscoped do
      yield
    end
  end

  def other_instances
    @user.course_users.map(&:course).map(&:instance).uniq - [current_tenant]
  end
end
