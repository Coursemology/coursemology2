# frozen_string_literal: true
module Course::Statistics::ReferenceTimesConcern
  private

  def personal_timeline_hash(assessment_id_array, course_id)
    personal_time = Course::PersonalTime.find_by_sql(<<-SQL.squish
      WITH course_user_personal_end_at AS (
        SELECT cpt.course_user_id, cpt.start_at, cpt.end_at, clpi.actable_id AS assessment_id
        FROM course_personal_times cpt
        JOIN (
          SELECT course_lesson_plan_items.id, course_lesson_plan_items.actable_id
          FROM course_lesson_plan_items
          WHERE course_lesson_plan_items.actable_type = 'Course::Assessment'
            AND course_lesson_plan_items.actable_id IN (#{assessment_id_array.join(', ')})
        ) clpi
        ON cpt.lesson_plan_item_id = clpi.id
      ),

      personal_times AS (
        SELECT cu.id AS course_user_id, pt.start_at, pt.end_at, pt.assessment_id
        FROM (
          SELECT course_users.id
          FROM course_users
          WHERE course_users.course_id = #{course_id}
        ) cu
        LEFT JOIN (
          SELECT course_user_id, start_at, end_at, assessment_id
          FROM course_user_personal_end_at
        ) pt
        ON cu.id = pt.course_user_id
      ),

      personal_reference_times AS (
        SELECT cu.id AS course_user_id, crt.start_at, crt.end_at, clpi.assessment_id
        FROM (
          SELECT course_users.id, course_users.reference_timeline_id
          FROM course_users
          WHERE course_users.course_id = #{course_id} AND course_users.role = #{CourseUser.roles[:student]}
        ) cu
        LEFT JOIN (
          SELECT reference_timeline_id, lesson_plan_item_id, start_at, end_at
          FROM course_reference_times
        ) crt
        ON crt.reference_timeline_id = cu.reference_timeline_id
        LEFT JOIN (
          SELECT id, actable_id AS assessment_id
          FROM course_lesson_plan_items
          WHERE course_lesson_plan_items.actable_type = 'Course::Assessment'
            AND course_lesson_plan_items.actable_id IN (#{assessment_id_array.join(', ')})
        ) clpi
        ON crt.lesson_plan_item_id = clpi.id
      )

      SELECT
        pt.assessment_id,
        pt.course_user_id,
        CASE WHEN pt.end_at IS NOT NULL THEN pt.end_at ELSE prt.end_at END AS end_at,
        CASE WHEN pt.start_at IS NOT NULL THEN pt.start_at ELSE prt.start_at END AS start_at
      FROM personal_times pt
      LEFT JOIN personal_reference_times prt
      ON
        pt.course_user_id = prt.course_user_id
        AND pt.assessment_id = prt.assessment_id
    SQL
                                                    )
    personal_time.map { |pt| [[pt.assessment_id, pt.course_user_id], [pt.start_at, pt.end_at]] }.to_h
  end

  def reference_times_hash(assessment_id_array, course_id)
    reference_times = Course::ReferenceTime.find_by_sql(<<-SQL.squish
      SELECT clpi.actable_id AS assessment_id, crt.start_at, crt.end_at
      FROM course_reference_times crt
      JOIN (
        SELECT id
        FROM course_reference_timelines
        WHERE course_id = #{course_id} AND "default" = TRUE
      ) crtl
      ON crt.reference_timeline_id = crtl.id
      JOIN (
        SELECT id, actable_id
        FROM course_lesson_plan_items
        WHERE course_lesson_plan_items.actable_type = 'Course::Assessment'
          AND course_lesson_plan_items.actable_id IN (#{assessment_id_array.join(', ')})
      ) clpi
      ON crt.lesson_plan_item_id = clpi.id
    SQL
                                                       )
    reference_times.map { |rt| [rt.assessment_id, [rt.start_at, rt.end_at]] }.to_h
  end
end
