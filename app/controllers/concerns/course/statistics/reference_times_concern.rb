# frozen_string_literal: true
module Course::Statistics::ReferenceTimesConcern
  private

  def personal_end_at_hash
    personal_end_at = Course::PersonalTime.find_by_sql(<<-SQL.squish
      WITH course_user_personal_end_at AS (
        SELECT course_user_id, end_at
        FROM course_personal_times cpt
        JOIN (
          SELECT course_lesson_plan_items.id
          FROM course_lesson_plan_items
          WHERE course_lesson_plan_items.actable_type = 'Course::Assessment'
            AND course_lesson_plan_items.actable_id = #{assessment_params[:id]}
        ) clpi
        ON cpt.lesson_plan_item_id = clpi.id
      ),

      personal_times AS (
        SELECT cu.id AS course_user_id, pt.end_at
        FROM (
          SELECT course_users.id
          FROM course_users
          WHERE course_users.course_id = #{@assessment.course.id}
        ) cu
        LEFT JOIN (
          SELECT course_user_id, end_at
          FROM course_user_personal_end_at
        ) pt
        ON cu.id = pt.course_user_id
      ),

      personal_reference_times AS (
        SELECT cu.id AS course_user_id, crt.end_at
        FROM (
          SELECT course_users.id, course_users.reference_timeline_id
          FROM course_users
          WHERE course_users.course_id = #{@assessment.course.id} AND course_users.role = #{CourseUser.roles[:student]}
        ) cu
        LEFT JOIN (
          SELECT reference_timeline_id, lesson_plan_item_id, end_at
          FROM course_reference_times
        ) crt
        ON crt.reference_timeline_id = cu.reference_timeline_id
        LEFT JOIN (
          SELECT id
          FROM course_lesson_plan_items
          WHERE course_lesson_plan_items.actable_type = 'Course::Assessment'
            AND course_lesson_plan_items.actable_id = #{assessment_params[:id]}
        ) clpi
        ON crt.lesson_plan_item_id = clpi.id
      )

      SELECT
        pt.course_user_id,
        CASE WHEN pt.end_at IS NOT NULL THEN pt.end_at ELSE prt.end_at END AS end_at
      FROM personal_times pt
      LEFT JOIN personal_reference_times prt
      ON pt.course_user_id = prt.course_user_id
    SQL
                                                      )
    personal_end_at.map { |pea| [pea.course_user_id, pea.end_at] }.to_h
  end

  def reference_times_hash
    reference_times = Course::ReferenceTime.find_by_sql(<<-SQL.squish
      SELECT clpi.actable_id AS lesson_plan_item_id, crt.end_at
      FROM course_reference_times crt
      JOIN (
        SELECT id
        FROM course_reference_timelines
        WHERE course_id = #{@assessment.course.id} AND "default" = TRUE
      ) crtl
      ON crt.reference_timeline_id = crtl.id
      JOIN (
        SELECT id, actable_id
        FROM course_lesson_plan_items
        WHERE course_lesson_plan_items.actable_type = 'Course::Assessment'
          AND course_lesson_plan_items.actable_id = #{assessment_params[:id]}
      ) clpi
      ON crt.lesson_plan_item_id = clpi.id
    SQL
                                                       )
    reference_times.map { |rt| [rt.lesson_plan_item_id, rt.end_at] }.to_h
  end
end
