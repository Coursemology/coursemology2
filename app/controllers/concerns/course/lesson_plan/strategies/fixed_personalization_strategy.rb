# frozen_string_literal: true
class Course::LessonPlan::Strategies::FixedPersonalizationStrategy <
  Course::LessonPlan::Strategies::BasePersonalizationStrategy
  # Returns a hash containing lesson plan item ids to submission time.
  #
  # @param [CourseUser] course_user The course user to compute data for.
  # @return [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] A hash of submitted lesson plan items' IDs to their
  #   submitted time, if relevant/available.
  def precompute_data(course_user)
    lesson_plan_items_submission_time_hash(course_user)
  end

  # Deletes all personal times that are not fixed or submitted. This basically causes the course user to follow the
  # reference timeline moving forward.
  #
  # @param [CourseUser] course_user The course user to compute data for.
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] precompute_data A hash of submitted lesson plan items' ID to
  #   their submitted time, if relevant/available.
  # @param [Set<Number>|nil] items_to_shift Unused and does not affect behaviour.
  def execute(course_user, precompute_data, _items_to_shift)
    course_user.personal_times.where(fixed: false).
      where.not(lesson_plan_item_id: precompute_data.keys).delete_all

    delete_all_future_stories_personal_times(course_user)
  end
end
