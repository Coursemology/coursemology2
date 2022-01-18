# frozen_string_literal: true
class Course::Group::GroupCategoriesController < Course::ComponentController
  load_and_authorize_resource :group_category, class: Course::GroupCategory
  before_action :add_group_breadcrumb

  def index
    if current_course.group_categories.exists?
      redirect_to course_group_category_path(current_course, current_course.group_categories.first)
    else
      render 'index'
    end
  end

  def show
  end

  def show_info
    @groups = @group_category.groups.ordered_by_name.includes(group_users: :course_user)
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
  end

  def destroy
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

  def add_group_breadcrumb
    add_breadcrumb :index, course_group_categories_path(current_course)
  end

  # @return [Course::GroupsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_groups_component]
  end
end
