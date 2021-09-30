# frozen_string_literal: true
class Course::Forum::Search
  include ActiveModel::Model
  include ActiveModel::Validations

  attr_reader :course_user_id, :course_user, :start_time, :end_time

  validates :course_user_id, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true

  # Prepares parameters for the search.
  #
  # @param [Hash] search_params
  def initialize(search_params)
    @course = search_params[:course]
    @course_user_id = search_params[:course_user_id]
    @start_time = parse_time(:start_time, search_params[:start_time])
    @end_time = parse_time(:end_time, search_params[:end_time])

    @course_user = @course.course_users.find(course_user_id) if course_user_id
    @user = course_user.user if course_user
  end

  # Returns a list of students' Course::Discussion::Posts created during the specified time
  # period by the given CourseUser.
  #
  # @return [Array<Course::Discussion::Post>]
  def posts
    return [] unless valid?

    @posts ||=
      Course::Discussion::Post.forum_posts.from_course(@course).
      includes(topic: { actable: :forum }).
      calculated(:upvotes, :downvotes).
      where(created_at: start_time..end_time).
      where(creator_id: @user)
  end

  private

  # Parses the given time strings.
  #
  # @return [ActiveSupport::TimeWithZone] If valid time string is supplied
  # @return [nil] If invalid time string is supplied
  def parse_time(attribute, time_string)
    time_string.blank? ? nil : DateTime.parse(time_string).in_time_zone
  rescue ArgumentError
    errors.add(attribute, :invalid_time)
    nil
  end
end
