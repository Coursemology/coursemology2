# frozen_string_literal: true
class Course::Group::GroupCategoriesController < Course::ComponentController
  include Course::Group::GroupManagerConcern

  load_and_authorize_resource :group_category, class: 'Course::GroupCategory'

  def index
    respond_to do |format|
      format.json
    end
  end

  def show
  end

  def show_info
    @groups = @group_category.groups.accessible_by(current_ability).ordered_by_name.includes(group_users: :course_user)
    @can_manage_category = can?(:manage, @group_category)
    @can_manage_groups = @can_manage_category || !@groups.empty?
  end

  def show_users
    @course_users = current_course.course_users.order_alphabetically
  end

  def create
    @group_category = Course::GroupCategory.new(group_category_params.reverse_merge(course: current_course))
    if @group_category.save
      render json: @group_category, status: :ok
    else
      render json: { errors: @group_category.errors }, status: :bad_request
    end
  end

  def create_groups
    @created_groups = []
    @failed_groups = []
    groups_params[:groups].each do |group|
      new_group = Course::Group.new(group.reverse_merge(group_category: @group_category))
      if new_group.save
        @created_groups << new_group
      else
        @failed_groups << new_group
      end
    end
  end

  def update
    if @group_category.update(group_category_params)
      render json: @group_category, status: :ok
    else
      render json: { errors: @group_category.errors }, status: :bad_request
    end
  end

  def update_group_members
    update_groups_params[:groups].each do |group|
      existing_group = Course::Group.preload(:group_users).find_by_id(group[:id])
      existing_users = existing_group.group_users.to_h { |u| [u.course_user.id, u] }
      new_users = group[:members].to_h { |u| [u[:id], u] }
      partitioned_users = partition_new_users(new_users, existing_users)

      add_new_members(partitioned_users[:to_add], existing_group)
      update_members(partitioned_users[:to_update], existing_users)
      destroy_members(partitioned_users[:to_destroy])
    end
    render json: { id: @group_category.id }, status: :ok
  end

  def destroy
    if @group_category.destroy
      render json: { id: @group_category.id }, status: :ok
    else
      render json: { error: @group_category.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def partition_new_users(new_users, existing_users)
    to_add = new_users.reject { |k, _| existing_users.key?(k) }
    to_update = new_users.select { |k, v| existing_users.key?(k) && v[:role] != existing_users[k].role }
    to_destroy = existing_users.reject { |k, _| new_users.key?(k) }
    { to_add: to_add, to_update: to_update, to_destroy: to_destroy }
  end

  def add_new_members(members_to_add, group)
    members_to_add.each do |_, member|
      new_group_user = Course::GroupUser.new(group: group, course_user_id: member[:id], role: member[:role])
      new_group_user.save
    end
  end

  def update_members(members_to_update, existing_users)
    members_to_update.each do |id, member|
      existing_group_user = existing_users[id]
      existing_group_user.update(role: member[:role])
    end
  end

  def destroy_members(members_to_destroy)
    members_to_destroy.each do |_, member|
      member.destroy
    end
  end

  def group_category_params
    params.permit(:name, :description)
  end

  def groups_params
    params.permit(groups: [
                    :name,
                    :description
                  ])
  end

  def update_groups_params
    params.permit(groups: [
                    :id,
                    members: [:id, :role] # id is course user id
                  ])
  end

  # @return [Course::GroupsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_groups_component]
  end
end
