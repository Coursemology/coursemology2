# frozen_string_literal: true

# This concern related to staff performance calculation.
module CourseUser::StaffConcern
  extend ActiveSupport::Concern

  included do
    # Sort the staff by their average marking time.
    # Note that nil time will be considered as the largest, which will come to the bottom of the
    #   list.
    #
    # @param [Array<CourseUser>] staff Course users to be sorted by average marking time.
    # @return [Array<CourseUser>] Course users sorted by average marking time.
    def self.order_by_average_marking_time(staff)
      staff.sort do |x, y|
        if x.average_marking_time && y.average_marking_time
          x.average_marking_time <=> y.average_marking_time
        else
          x.average_marking_time ? -1 : 1
        end
      end
    end
  end

  # Returns the published submissions for the purpose of calculating marking statistics.
  #
  # This inlcudes only submissions from non-phantom, student course_users.
  def published_submissions
    @published_submissions ||=
      Course::Assessment::Submission.
      joins(experience_points_record: :course_user).
      where('course_users.role = ?', CourseUser.roles[:student]).
      where('course_users.phantom = ?', false).
      where('course_assessment_submissions.publisher_id = ?', user_id).
      where('course_users.course_id = ?', course_id)
  end

  # Returns the average marking time of the staff.
  #
  # @return [Float] Time in seconds.
  def average_marking_time
    @average_marking_time ||=
      if valid_submissions.empty?
        nil
      else
        valid_submissions.sum { |s| s.published_at - s.submitted_at } / valid_submissions.size
      end
  end

  # Returns the standard deviation of the marking time of the staff.
  #
  # @return [Float]
  def marking_time_stddev
    # An array of time in seconds.
    time_diff = valid_submissions.map { |s| s.published_at - s.submitted_at }
    standard_deviation(time_diff)
  end

  private

  def valid_submissions
    @valid_submissions ||=
      published_submissions.
      select { |s| s.submitted_at && s.published_at && s.published_at > s.submitted_at }
  end

  # Calculate the standard deviation of an array of time.
  def standard_deviation(array)
    return nil if array.empty?

    Math.sqrt(sample_variance(array))
  end

  def mean(array)
    array.sum / array.length.to_f
  end

  def sample_variance(array)
    m = mean(array)
    sum = array.reduce(0) { |acc, elem| acc + (elem - m)**2 }
    sum / array.length.to_f
  end
end
