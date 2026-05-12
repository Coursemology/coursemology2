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

      tenant_id = current_tenant.id

      ActsAsTenant.without_tenant do
        all_instance_users = InstanceUser.includes(:instance).
                             where(user_id: @user.id).
                             to_a

        instance_users, @instances =
          all_instance_users.partition { |iu| iu.instance_id == tenant_id }

        @instance_user = instance_users.first
      end
    end
  end
end
