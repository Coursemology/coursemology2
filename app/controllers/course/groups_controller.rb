# frozen_string_literal: true
class Course::GroupsController < Course::ComponentController
  add_breadcrumb :index, :course_groups_path

  # TODO: Handle authorization
  def index
    @groups = group_category.nil? ? [] : group_category.groups.ordered_by_name.includes(group_users: :course_user)
    # @categories = Course::GroupCategory.includes(groups: { group_users: :course_user })
    # @course_users = current_course.course_users.order_alphabetically
  end

  def show # :nodoc:
    @group_users = @group.group_users.includes(:course_user)
    @group_managers, @group_users = @group_users.partition(&:manager?)
  end

  def new # :nodoc:
  end

  def create # :nodoc:
    if @group.save
      redirect_to edit_course_group_path(current_course, @group),
                  success: t('.success', name: @group.name)
    else
      render 'new'
    end
  end

  def edit # :nodoc:
  end

  def update # :nodoc:
    if @group.update(group_params)
      redirect_to course_groups_path(current_course), success: t('.success', name: @group.name)
    else
      render 'edit'
    end
  end

  def destroy # :nodoc:
    if @group.destroy
      redirect_to course_groups_path(current_course),
                  success: t('.success', name: @group.name)
    else
      redirect_to course_groups_path, danger: @group.errors.full_messages.to_sentence
    end
  end

  private

  # Merges the parameters for group category ID from either the group parameter or the query string.
  def group_category_params
    params.permit(:group_category, group: [:group_category]).tap do |group_category_params|
      group_category_params.merge!(group_category_params.delete(:group)) if group_category_params.key?(:group)
    end
  end

  def group_category
    @group_category ||=
      if group_category_params[:group_category]
        current_course.group_categories.find(group_category_params[:group_category])
      else
        current_course.group_categories.first!
      end
  end

  def group_params # :nodoc:
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
