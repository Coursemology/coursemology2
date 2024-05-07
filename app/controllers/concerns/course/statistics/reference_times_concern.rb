# frozen_string_literal: true
module Course::Statistics::ReferenceTimesConcern
  private

  def personal_timeline_hash(assessment_id_array, course_id)
    personal_time = Course::PersonalTime.find_by_sql(<<-SQL.squish
      WITH course_user_personal_end_at AS (
        SELECT cpt.course_user_id, cpt.start_at, cpt.end_at, cpt.fixed, clpi.actable_id AS assessment_id
        FROM course_personal_times cpt
        JOIN course_lesson_plan_items clpi
        ON cpt.lesson_plan_item_id = clpi.id
        WHERE clpi.actable_type = 'Course::Assessment'
        AND clpi.actable_id IN (#{assessment_id_array.join(', ')})
      ),

      personal_times AS (
        SELECT cu.id AS course_user_id, pt.start_at, pt.end_at, pt.fixed, pt.assessment_id
        FROM course_users cu
        LEFT JOIN course_user_personal_end_at pt
        ON cu.id = pt.course_user_id
        WHERE cu.course_id = #{course_id}
      ),

      personal_reference_times AS (
        SELECT cu.id AS course_user_id, crt.start_at, crt.end_at, clpi.actable_id AS assessment_id
        FROM course_users cu
        LEFT JOIN course_reference_times crt
        ON crt.reference_timeline_id = cu.reference_timeline_id
        LEFT JOIN course_lesson_plan_items clpi
        ON crt.lesson_plan_item_id = clpi.id
        WHERE
          cu.course_id = #{course_id}
          AND cu.role = #{CourseUser.roles[:student]}
          AND clpi.actable_type = 'Course::Assessment'
          AND clpi.actable_id IN (#{assessment_id_array.join(', ')})
      )

      SELECT
        pt.assessment_id,
        pt.course_user_id,
        CASE WHEN pt.end_at IS NOT NULL THEN pt.end_at ELSE prt.end_at END AS end_at,
        CASE WHEN pt.start_at IS NOT NULL THEN pt.start_at ELSE prt.start_at END AS start_at,
        CASE WHEN pt.fixed IS NOT NULL THEN pt.fixed ELSE FALSE END AS is_fixed
      FROM personal_times pt
      LEFT JOIN personal_reference_times prt
      ON
        pt.course_user_id = prt.course_user_id
        AND pt.assessment_id = prt.assessment_id
    SQL
                                                    )
    personal_time.map { |pt| [[pt.assessment_id, pt.course_user_id], [pt.start_at, pt.end_at, pt.is_fixed]] }.to_h
  end

  def reference_times_hash(assessment_id_array, course_id)
    reference_times = Course::ReferenceTime.find_by_sql(<<-SQL.squish
      SELECT clpi.actable_id AS assessment_id, crt.start_at, crt.end_at
      FROM course_reference_times crt
      JOIN course_reference_timelines crtl
      ON crt.reference_timeline_id = crtl.id
      JOIN course_lesson_plan_items clpi
      ON crt.lesson_plan_item_id = clpi.id
      WHERE
        crtl.course_id = #{course_id}
        AND crtl.default = TRUE
        AND clpi.actable_type = 'Course::Assessment'
        AND clpi.actable_id IN (#{assessment_id_array.join(', ')})
    SQL
                                                       )
    reference_times.map { |rt| [rt.assessment_id, [rt.start_at, rt.end_at, nil]] }.to_h
  end
end
