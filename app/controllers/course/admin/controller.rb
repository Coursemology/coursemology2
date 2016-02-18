# frozen_string_literal: true
class Course::Admin::Controller < Course::ComponentController
  add_breadcrumb :admin, :course_admin_path
  layout 'course_admin'

  before_action :authorize_admin

  private

  def authorize_admin
    authorize!(:manage, current_course)
  end
end
