# frozen_string_literal: true
class Course::Group::GroupCategoriesController < Course::ComponentController
  include Course::Group::GroupManagerConcern

  load_resource :group_category, class: Course::GroupCategory
  before_action :add_group_breadcrumb

  def index
    if viewable_group_categories.exists?
      redirect_to course_group_category_path(current_course, viewable_group_categories.ordered_by_name.first)
    else
      # We test if the user can read an arbitrary category
      category = Course::GroupCategory.new(course: current_course)
      authorize! :read, category

      render 'index'
    end
  end

  def show
    authorize! :read, @group_category
  end

  def show_info
    authorize! :read, @group_category
    @groups = @group_category.groups.accessible_by(current_ability).ordered_by_name.includes(group_users: :course_user)
    @can_manage_category = can?(:manage, @group_category)
    @can_manage_groups = @can_manage_category || !@groups.empty?
  end

  def show_users
    authorize! :read, @group_category
    @course_users = current_course.course_users.order_alphabetically
  end

  def create
    @group_category = Course::GroupCategory.new(group_category_params.reverse_merge(course: current_course))
    authorize! :manage, @group_category
    if @group_category.save
      render json: @group_category, status: :ok
    else
      render json: { errors: @group_category.errors }, status: :bad_request
    end
  end

  def create_groups
    authorize! :manage, @group_category
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
    authorize! :manage, @group_category
    if @group_category.update(group_category_params)
      render json: @group_category, status: :ok
    else
      render json: { errors: @group_category.errors }, status: :bad_request
    end
  end

  def update_group_members
    update_groups_params[:groups].each do |group|
      existing_group = Course::Group.find_by_id(group[:id])
      authorize! :manage, existing_group
      existing_users = existing_group.group_users.map { |u| [u.course_user.id, u] }.to_h
      new_users = group[:members].map { |u| [u[:id], u] }.to_h
      to_add = new_users.reject { |k, _| existing_users.key?(k) }
      to_delete = existing_users.reject { |k, _| new_users.key?(k) }
      to_update = new_users.select { |k, v| existing_users.key?(k) && v[:role] != existing_users[k].role }

      to_add.each do |_, member|
        # course_user = CourseUser.find_by_id(member[:id])
        new_group_user = Course::GroupUser.new(group: existing_group, course_user_id: member[:id], role: member[:role])
        new_group_user.save
      end
      # This is already a group user
      to_delete.each do |_, member|
        member.destroy
      end
      to_update.each do |id, member|
        existing_group_user = existing_users[id]
        existing_group_user.update(role: member[:role])
      end
    end
    render json: { id: @group_category.id }, status: :ok
  end

  def destroy
    authorize! :manage, @group_category
    if @group_category.destroy
      render json: { id: @group_category.id }, status: :ok
    else
      render json: { error: @group_category.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

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

  def add_group_breadcrumb
    add_breadcrumb :index, course_group_categories_path(current_course)
  end

  # @return [Course::GroupsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_groups_component]
  end
end
