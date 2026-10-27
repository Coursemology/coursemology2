# frozen_string_literal: true
# Records that a student had at least one activity in a course during a month (the first day of that month, UTC).
#
# The ids deliberately have no foreign keys or associations that act on deletion: marks outlive the user, course and
# instance they name, so that past activity statistics do not shrink. See CreateCourseActivityMarks.
#
# TODO: Write marks as activities are created, recording the actor's role at that time. Until then marks only come
# from db:backfill_course_activity_marks, so the current month stays empty until it is backfilled.
class Course::ActivityMark < ApplicationRecord
end
