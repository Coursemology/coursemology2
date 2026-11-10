# frozen_string_literal: true
#
# Retires Koditsu v1. Every v1 workspace, assessment and question ID moves from its live column to a koditsu_v1_*
# column, so that the live columns only ever hold Koditsu v2 IDs from now on: v2 cannot use v1 IDs.
#
# A course holding a v1 workspace is "v1-linked" (Course#koditsu_v1_linked?), and Koditsu is denied there until its
# v1 links are cleared. That check reads the course alone, so `up` refuses to run if any assessment or question
# carries a v1 ID in a course without one.
#
# The v1 IDs are kept for tracing, and for linking back if v1 access is restored: `down` puts them back.
#
# An assessment or question whose live ID is cleared is also marked unsynced (is_synced_with_koditsu), since it is
# no longer synced with anything. Sync skips objects marked synced, so otherwise a course cleared of its v1 links
# would never recreate them in v2. `down` leaves them unsynced; the next sync then pushes them to v1 again.
#
# Only a handful of rows are touched, so the schema and data changes share one transaction.
class RetireKoditsuV1Links < ActiveRecord::Migration[8.1]
  LINKS = {
    courses: [:koditsu_workspace_id, :koditsu_v1_workspace_id],
    course_assessments: [:koditsu_assessment_id, :koditsu_v1_assessment_id],
    course_assessment_questions: [:koditsu_question_id, :koditsu_v1_question_id]
  }.freeze
  SYNC_FLAGGED_TABLES = [:course_assessments, :course_assessment_questions].freeze

  def up
    assert_every_link_has_a_workspace!

    LINKS.each do |table, (live, v1)|
      add_column table, v1, :string
      unsync = SYNC_FLAGGED_TABLES.include?(table) ? ', is_synced_with_koditsu = FALSE' : ''
      execute "UPDATE #{table} SET #{v1} = #{live}, #{live} = NULL#{unsync} WHERE #{live} IS NOT NULL"
    end
  end

  # Refuses rather than overwrite: a row that has since been linked to v2 holds both IDs.
  def down
    LINKS.each do |table, (live, v1)|
      if select_value("SELECT EXISTS (SELECT 1 FROM #{table} WHERE #{v1} IS NOT NULL AND #{live} IS NOT NULL)")
        raise ActiveRecord::IrreversibleMigration, "#{table} has rows linked to both Koditsu v1 and v2"
      end

      execute "UPDATE #{table} SET #{live} = #{v1} WHERE #{v1} IS NOT NULL"
      remove_column table, v1
    end
  end

  private

  def assert_every_link_has_a_workspace!
    orphaned_course_ids = select_values(<<~SQL)
      SELECT DISTINCT lpi.course_id
      FROM course_assessments a
      JOIN course_lesson_plan_items lpi ON lpi.actable_type = 'Course::Assessment' AND lpi.actable_id = a.id
      JOIN courses c ON c.id = lpi.course_id
      LEFT JOIN course_question_assessments qa ON qa.assessment_id = a.id
      LEFT JOIN course_assessment_questions q ON q.id = qa.question_id
      WHERE c.koditsu_workspace_id IS NULL
        AND (a.koditsu_assessment_id IS NOT NULL OR q.koditsu_question_id IS NOT NULL)
      ORDER BY lpi.course_id
    SQL
    return if orphaned_course_ids.empty?

    raise "Koditsu v1 IDs in courses without a v1 workspace: #{orphaned_course_ids.join(', ')}"
  end
end
