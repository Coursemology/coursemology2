# frozen_string_literal: true
class UsersController < ApplicationController
  load_resource :user

  def show
    if @user.built_in?
      render 'public/404', layout: false, status: :not_found
    else
      course_users =
        @user.course_users.with_course_statistics.from_instance(current_tenant).includes(:course)
      @current_course_users = course_users.merge(Course.current)
      @completed_course_users = course_users.merge(Course.completed)
      @instances = other_instances
    end
  end

  private

  def other_instances
    tenant = current_tenant
    ActsAsTenant.without_tenant { Instance.containing_user(@user) - [tenant] }
  end
end
