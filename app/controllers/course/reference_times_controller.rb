# frozen_string_literal: true
class Course::ReferenceTimesController < Course::ReferenceTimelinesController
  load_and_authorize_resource :reference_time, through: :reference_timeline

  def create
    if @reference_time.save
      render json: { id: @reference_time.id }
    else
      render json: { errors: @reference_time.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def update
    if @reference_time.update(reference_time_params)
      head :ok
    else
      render json: { errors: @reference_time.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @reference_time.destroy
      head :ok
    else
      render json: { errors: @reference_time.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def self.base_params
    [:lesson_plan_item_id, :start_at, :bonus_end_at, :end_at]
  end

  private

  def reference_time_params
    params.require(:reference_time).permit(*self.class.base_params)
  end
end
