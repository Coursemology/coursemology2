# frozen_string_literal: true
class UsersController < ApplicationController
  load_resource :user
  before_action :set_course
  before_action :set_course_user, only: [:destroy]

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

  def destroy
    if @course_user.student?
      @course_user.destroy
      respond_to do |format|
        format.html { redirect_to course_users_path(@course), notice: 'Student was successfully removed from the course.' }
        format.json { head :no_content }
      end
    else
      respond_to do |format|
        format.html { redirect_to course_users_path(@course), alert: 'Only students can be removed.' }
        format.json { render json: { error: 'Only students can be removed' }, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_course
    @course = Course.find(params[:course_id])
  end

  def set_course_user
    @course_user = @course.course_users.find(params[:id])
  end
end
