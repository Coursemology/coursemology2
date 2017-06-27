# frozen_string_literal: true
class Course::Achievement::AchievementsController < Course::Achievement::Controller
  before_action :authorize_achievement!, only: [:update]

  def index #:nodoc:
    @achievements = @achievements.includes(:conditions)
  end

  def show #:nodoc:
  end

  def create #:nodoc:
    if @achievement.save
      render json: { id: @achievement.id }, status: :ok
    else
      render json: { errors: @achievement.errors }, status: :bad_request
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @achievement.update_attributes(achievement_params)
      head :ok
    else
      render json: { errors: @achievement.errors }, status: :bad_request
    end
  end

  def destroy #:nodoc:
    if @achievement.destroy
      redirect_to course_achievements_path(current_course),
                  success: t('.success', title: @achievement.title)
    else
      redirect_to course_achievements_path,
                  danger: t('.failure', error: @achievement.errors.full_messages.to_sentence)
    end
  end

  def reorder
    unless valid_ordering?(achievement_order_params)
      raise ArgumentError, 'Invalid ordering for achievements'
    end

    Course::Achievement.transaction do
      achievement_order_params.each_with_index do |id, index|
        achievements_hash[id].update_attribute(:weight, index)
      end
    end

    head :ok
  end

  private

  def achievement_params #:nodoc:
    @achievement_params ||= params.require(:achievement).
                            permit(:title, :description, :weight, :published, :badge,
                                   course_user_ids: [])
  end

  def achievement_order_params
    params.require(:achievement_order)
  end

  # Only allow awarding of manually awarded achievements.
  def authorize_achievement!
    authorize!(:award, @achievement) if achievement_params.include?(:course_user_ids)
  end

  # Maps achievement ids to their respective achievements
  #
  # @return [Hash{Integer => Course::Achievement}]
  def achievements_hash
    @achievements_hash ||= current_course.achievements.map do |achievement|
      [achievement.id.to_s, achievement]
    end.to_h
  end

  # Checks if a proposed achievement ordering is valid
  #
  # @param [Array<Integer>] proposed_ordering
  # @return [Boolean]
  def valid_ordering?(proposed_ordering)
    achievements_hash.keys.sort == proposed_ordering.sort
  end
end
