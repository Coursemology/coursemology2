# frozen_string_literal: true
class Course::GroupsController < Course::ComponentController
  load_and_authorize_resource :group, through: :course, class: Course::Group.name
  add_breadcrumb :index, :course_groups_path

  def index #:nodoc:
    @groups = @groups.ordered_by_name.includes(group_users: { course_user: :course })
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @group.save
      redirect_to edit_course_group_path(current_course, @group),
                  success: t('.success', name: @group.name)
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @group.update_attributes(group_params)
      redirect_to course_groups_path(current_course), success: t('.success', name: @group.name)
    else
      render 'edit'
    end
  end

  def destroy #:nodoc
    if @group.destroy
      redirect_to course_groups_path(current_course),
                  success: t('.success', name: @group.name)
    else
      redirect_to course_groups_path, danger: @group.errors.full_messages.to_sentence
    end
  end

  private

  def group_params #:nodoc:
    params.require(:group).
      permit(:name, course_user_ids: [],
                    group_users_attributes: [:id, :course_user_id, :role, :_destroy])
  end

  # @return [Course::GroupsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_groups_component]
  end
end
