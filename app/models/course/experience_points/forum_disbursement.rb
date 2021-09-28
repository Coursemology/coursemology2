# frozen_string_literal: true
class Course::ExperiencePoints::ForumDisbursement < Course::ExperiencePoints::Disbursement
  # @!attribute [rw] start_time
  # Start of the period to compute forum participation statistics for.
  # If no valid start time is specified, a default start time is computed,
  # based on the given end time, if a valid one is specified, otherwise,
  # it default to the start of last Monday.
  #
  # @return [ActiveSupport::TimeWithZone]
  def start_time
    @start_time ||
      if @end_time
        @end_time - disbursement_interval
      else
        DateTime.current.at_beginning_of_week.beginning_of_day.in_time_zone - disbursement_interval
      end
  end

  # @param [String] start_time_param
  def start_time=(start_time_param)
    @start_time = start_time_param.blank? ? nil : DateTime.parse(start_time_param).in_time_zone
  end

  # @!attribute [rw] end_time
  # End of the period to compute forum participation statistics for.
  # If no valid end time is specified, a default end time is computed,
  # based on the given start time, if a valid one is specified, otherwise,
  # it defaults to the end of the Sunday that just passed.
  #
  # @return [ActiveSupport::TimeWithZone]
  def end_time
    @end_time ||
      if @start_time
        @start_time + disbursement_interval
      else
        DateTime.current.at_beginning_of_week.end_of_day.in_time_zone - 1.day
      end
  end

  # @param [String] end_time_param
  def end_time=(end_time_param)
    @end_time = end_time_param.blank? ? nil : DateTime.parse(end_time_param).in_time_zone
  end

  # @!attribute [rw] weekly_cap
  # The cap on the number of experience points to give out per week for forum participation.
  # This will be pro-rated based on the number of weeks in the period.
  # A default of 100 is set. This can be made a setting when the needs arises.
  #
  # @return [Integer]
  def weekly_cap
    @weekly_cap ||= 100
  end

  # @param [String] weekly_cap_param
  def weekly_cap=(weekly_cap_param)
    @weekly_cap = weekly_cap_param.to_i
  end

  # Returns experience points records for the disbursement.
  #
  # @return [Array<Course::ExperiencePointsRecords>] The points records for this disbursement.
  def experience_points_records
    preload_levels
    @experience_points_records ||= student_participation_points.map do |student, points|
      student.experience_points_records.build(points_awarded: points)
    end
  end

  # Maps each student to a hash with
  #   1. Number of posts by the student during the given period
  #   2. The aggregated vote tally for the student's posts within the period
  #   3. An overall score that measures the student's participation for the period
  #
  # @return [Hash<CourseUser, Hash>]
  def student_participation_statistics
    @student_participation_statistics ||=
      discussion_posts.group_by(&:creator).
      each_with_object({}) do |(user, posts), hash|
        post_count = posts.size
        vote_count = posts.map(&:vote_tally).reduce(&:+)
        score = post_count + vote_count
        course_user = course_users_hash[user]
        hash[course_user] = { posts: post_count, votes: vote_count, score: score }
      end
  end

  # The search parameters for the current disbursement.
  #
  # @return [Hash]
  def params_hash
    {
      experience_points_forum_disbursement: {
        start_time: start_time, end_time: end_time, weekly_cap: weekly_cap
      }
    }
  end

  private

  def disbursement_interval
    1.week
  end

  # The cap on how many experience points to award a student for the given time period.
  #
  # @return [Integer]
  def actual_cap
    seconds_in_a_week = 604_800
    @actual_cap ||= (weekly_cap * (end_time - start_time) / seconds_in_a_week).ceil
  end

  # Returns a hash that maps each student to the computed forum participation points.
  # Points are assigned in proportion to a student's ranking compared to the other students.
  # Student with the same forum participation score will be assigned the same number of points
  # for fairness.
  #
  # @return [Hash<CourseUser, Integer>]
  def student_participation_points
    return {} if student_participation_statistics.empty?

    score_gap_between_groups = (actual_cap / ranked_statistic_groups.size).floor
    points_for_current_group = actual_cap
    ranked_statistic_groups.each_with_object({}) do |(_, course_user_statistics), hash|
      course_user_statistics.each do |course_user, _|
        hash[course_user] = points_for_current_group
      end
      points_for_current_group -= score_gap_between_groups
    end
  end

  # Grouped and ranked student participation statistics.
  #
  # @return [Hash<Interger, Array[Hash]>]
  def ranked_statistic_groups
    @ranked_statistic_groups ||= student_participation_statistics.
                                 group_by { |_, statistics| statistics[:score] }.
                                 sort_by { |score, _| score }.reverse!
  end

  # Returns a list of students' Course::Discussion::Posts created during the specified time
  # period.
  #
  # @return [Array<Course::Discussion::Post>]
  def discussion_posts
    return [] if end_time_preceeds_start_time?

    @discussion_posts ||= begin
      user_ids = forum_participants.map(&:user_id)
      Course::Discussion::Post.forum_posts.from_course(course).calculated(:upvotes, :downvotes).
        where(created_at: start_time..end_time).
        where(creator_id: user_ids)
    end
  end

  # Check if end time preceeds start time and sets an error if necessary.
  #
  # @return [Boolean]
  def end_time_preceeds_start_time?
    preceeds = start_time > end_time
    errors.add(:end_time, :invalid_period) if preceeds
    preceeds
  end

  # Students who can potentially be awarded forum experience points.
  #
  # @return [Array<CourseUser>]
  def forum_participants
    @forum_participants ||= course.course_users.students.
                            calculated(:experience_points).includes(:user)
  end

  # Pre-loads course levels to avoid N+1 queries when course_user.level_numbers are displayed.
  def preload_levels
    course.levels.to_a
  end

  # Maps Users to CourseUsers that are in the current course.
  #
  # @return [Hash<User, CourseUser>]
  def course_users_hash
    @course_users_hash ||= forum_participants.each_with_object({}) do |course_user, hash|
      hash[course_user.user] = course_user
    end
  end
end
