class Course::GroupsController < Course::ComponentController
  load_and_authorize_resource :group, through: :course, class: Course::Group.name

  def index #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @group.save
      redirect_to(edit_course_group_path(current_course, @group),
                  success: t('.success', name: @group.name))
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @group.update_attributes(group_params)
      redirect_to(course_groups_path(current_course), success: t('.success', title: @group.name))
    else
      render 'edit'
    end
  end

  private

  def group_params #:nodoc:
    params.require(:group).permit(:name, user_ids: [])
  end
end
