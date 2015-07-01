class Course::Admin::Controller < Course::ComponentController
  add_breadcrumb :admin, :course_admin_path
  layout 'course_admin'
end
