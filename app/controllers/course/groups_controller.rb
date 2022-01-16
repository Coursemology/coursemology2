# frozen_string_literal: true
class Course::GroupsController < Course::ComponentController
  add_breadcrumb :index, :course_groups_path

  # TODO: Handle authorization
  def index
    @group_category = group_category_or_first
  end

  def index_category
    @groups = group_category_or_first.nil? ? [] : group_category_or_first.groups.ordered_by_name.includes(group_users: :course_user)
  end

  def create_category
    @group_category = Course::GroupCategory.new(create_or_update_category_params.reverse_merge(course: current_course))
    if @group_category.save
      render json: { id: @group_category.id }, status: :ok
    else
      render json: { errors: @group_category.errors }, status: :bad_request
    end
  end

  # This method handles both the creation of a single group and multiple groups.
  def create_groups
    # TODO: Create groups
  end

  def update_category
    if group_category.update(create_or_update_category_params)
      render json: { id: group_category.id }, status: :ok
    else
      render json: { errors: group_category.errors }, status: :bad_request
    end
  end

  def update_category_groups
    # TODO: Mass update the groups of a category
  end

  def destroy_category
    if group_category.destroy
      render json: { id: group_category.id }, status: :ok
    else
      render json: { error: group_category.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy_group
    # TODO: Destroy group
  end

  private

  # Merges the parameters for group category ID from either the group parameter or the query string.
  def category_params
    params.permit(:group_category, group: [:group_category]).tap do |category_params|
      category_params.merge!(category_params.delete(:group)) if category_params.key?(:group)
    end
  end

  # Throw error if the group_category isn't specified
  def group_category
    @group_category ||= current_course.group_categories.find(category_params[:group_category])
  end

  def group_category_or_first
    @group_category ||= # rubocop:disable Naming/MemoizedInstanceVariableName
      if category_params[:group_category]
        current_course.group_categories.find(category_params[:group_category])
      else
        current_course.group_categories.first!
      end
  end

  def create_or_update_category_params
    params.permit(:name, :description)
  end

  def group_params
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
