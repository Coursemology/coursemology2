# frozen_string_literal: true
# Records that a student had at least one activity in a course during a month (the first day of that month, UTC).
#
# The ids deliberately have no foreign keys or associations that act on deletion: marks outlive the user, course and
# instance they name, so that past activity statistics do not shrink. See CreateCourseActivityMarks.
#
# Marks are written as activities are created (see .record_for), and db:backfill_course_activity_marks derives them
# for months before that.
class Course::ActivityMark < ApplicationRecord
  class << self
    # Records a mark for the activity's actor, under the same rules as db:backfill_course_activity_marks: the actor
    # must be a non-phantom student of the activity's course, and not a system administrator or an administrator of
    # the course's instance. Unlike the backfill, the role is the one the actor has as the activity is created.
    #
    # Marks are statistics, so a failure is logged rather than raised, to never fail the action behind the activity.
    #
    # @param [Activity] activity The activity, once committed.
    # @return [Boolean] True if a new mark was recorded.
    def record_for(activity)
      user_id = activity.actor_id
      return false if user_id == User::SYSTEM_USER_ID

      # Every lookup is by id, so the tenant does not need to match the course's instance, or be set at all.
      ActsAsTenant.without_tenant do
        course = course_of(activity.object)
        next false unless course

        mark = { course_id: course.id, month: activity.created_at.utc.to_date.beginning_of_month, user_id: user_id }
        # Most activities are by students already marked for the month, which this settles in one lookup.
        next false if exists?(mark) || !counted?(course, user_id)

        # Skips the mark if it was recorded concurrently (ON CONFLICT DO NOTHING).
        insert(mark.merge(instance_id: course.instance_id)).length == 1
      end
    rescue StandardError => e
      Rails.logger.error("Failed to record activity mark for activity #{activity.id}: #{e.message}")
      false
    end

    private

    # The course an activity's object belongs to, for the object types db:backfill_course_activity_marks attributes.
    # Others, such as the course itself (opening reminders), are not attributed.
    def course_of(object)
      case object
      when Course::Assessment::Submission then object.assessment&.course
      when Course::Discussion::Post then object.topic&.course
      when Course::Assessment, Course::Forum::Topic, Course::Video, Course::Achievement, Course::Level,
           Course::Announcement
        object.course
      end
    end

    def counted?(course, user_id)
      CourseUser.exists?(course: course, user_id: user_id, role: :student, phantom: false) &&
        !User.administrator.exists?(id: user_id) &&
        !InstanceUser.administrator.exists?(instance_id: course.instance_id, user_id: user_id)
    end
  end
end
