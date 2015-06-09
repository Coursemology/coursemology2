class Course::GroupsController < Course::ComponentController
  load_and_authorize_resource :group, through: :course, class: Course::Group.name

  def index #:nodoc:
  end
end
