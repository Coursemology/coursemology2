# frozen_string_literal: true
module Course::Statistics::UsersConcern
  private

  def group_names_hash
    group_names = Course::Group.find_by_sql(<<-SQL.squish
      WITH course_students AS (
        SELECT cgu.group_id, cgu.course_user_id
        FROM course_group_users cgu
        JOIN (
          SELECT course_users.id
          FROM course_users
          WHERE course_users.role = #{CourseUser.roles[:student]}
          AND course_users.course_id = #{current_course.id}
        ) cu
        ON cgu.course_user_id = cu.id
      ),

      course_group_names AS (
        SELECT course_groups.id, course_groups.name
        FROM course_groups
      )

      SELECT id, ARRAY_AGG(group_name) AS group_names
      FROM (
        SELECT
          cs.course_user_id as id,
          cgn.name as group_name
        FROM course_students cs
        JOIN course_group_names cgn
        ON cs.group_id = cgn.id
      ) group_tables
      GROUP BY group_tables.id
    SQL
                                           )
    group_names.map { |course_user| [course_user.id, course_user.group_names] }.to_h
  end
end
