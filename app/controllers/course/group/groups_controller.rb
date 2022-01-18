# frozen_string_literal: true
class Course::Group::GroupsController < Course::ComponentController
  load_and_authorize_resource :group, class: Course::Group

  def update
    if @group.update(group_params)
      render json: @group, status: :ok
    else
      render json: { errors: @group.errors }, status: :bad_request
    end
  end

  def destroy
    if @group.destroy
      render json: { id: @group.id }, status: :ok
    else
      render json: { error: @group.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def group_params
    params.permit(:name, :description)
  end
end
