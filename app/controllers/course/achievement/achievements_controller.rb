# frozen_string_literal: true
class Course::Achievement::AchievementsController < Course::Achievement::Controller
  before_action :authorize_achievement!, only: [:update]

  def index
    @achievements = @achievements.includes([:conditions, :course_user_achievements])
  end

  def show
    @achievement_users = @achievement.course_users.without_phantom_users.students.includes([:user, :course])
    respond_to do |format|
      format.json { render 'show' }
    end
  end

  def create
    # Add achievement to the most bottom of existing achievements in a course.
    @achievement.weight = current_course.achievements.size + 1
    if @achievement.save
      render json: { id: @achievement.id }, status: :ok
    else
      render json: { errors: @achievement.errors }, status: :bad_request
    end
  end

  def update
    if @achievement.update(achievement_params)
      @achievement_users = @achievement.course_users.without_phantom_users.students.includes([:user, :course])
      respond_to do |format|
        format.json { render 'show' }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @achievement.errors }, status: :bad_request }
      end
    end
  end

  def destroy
    if @achievement.destroy
      head :ok
    else
      head :bad_request
    end
  end

  def reorder
    raise ArgumentError, 'Invalid ordering for achievements' unless valid_ordering?(achievement_order_params)

    Course::Achievement.transaction do
      achievement_order_params.each_with_index do |id, index|
        achievements_hash[id].update_column(:weight, index)
      end
    end

    head :ok
  end

  def achievement_course_users
    authorize!(:award, @achievement)
    course_users = current_course.course_users.students.order_alphabetically
    achievement_course_users = course_users.
                               joins("LEFT JOIN course_user_achievements
                                      ON course_users.id = course_user_achievements.course_user_id
                                      AND course_user_achievements.achievement_id = (#{@achievement.id}) ").
                               select('course_users.id, LTRIM(course_users.name) AS name,
                                       course_users.phantom,
                                       course_user_achievements.obtained_at AS "obtainedAt"')

    respond_to do |format|
      format.json { render json: { achievementCourseUsers: achievement_course_users }, status: :ok }
    end
  end

  private

  def achievement_params
    @achievement_params ||= begin
      result = params.require(:achievement).
               permit(:title, :description, :weight, :published, :badge, course_user_ids: [])
      result[:badge].is_a?(ActionDispatch::Http::UploadedFile) ? result : result.except(:badge)
    end
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
    @achievements_hash ||= current_course.achievements.to_h do |achievement|
      [achievement.id.to_s, achievement]
    end
  end

  # Checks if a proposed achievement ordering is valid
  #
  # @param [Array<Integer>] proposed_ordering
  # @return [Boolean]
  def valid_ordering?(proposed_ordering)
    achievements_hash.keys.sort == proposed_ordering.sort
  end
end
