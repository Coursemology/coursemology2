# frozen_string_literal: true
#
# A programming question's previous versions are kept as snapshot rows in this same table, each pointing at
# the live question through current_id, and recording when and by whom it was superseded. Live rows leave all
# three NULL, so nothing needs backfilling, and the partial indexes only ever hold snapshot rows.
class AddSnapshotColumnsToCourseAssessmentQuestionProgramming < ActiveRecord::Migration[8.1]
  def change
    add_reference :course_assessment_question_programming, :current,
                  type: :integer,
                  foreign_key: { to_table: :course_assessment_question_programming,
                                 name: 'fk_course_assessment_question_programming_current_id' },
                  index: { name: 'fk__course_assessment_question_programming_current_id',
                           where: 'current_id IS NOT NULL' }

    add_column :course_assessment_question_programming, :superseded_at, :datetime
    add_reference :course_assessment_question_programming, :superseder,
                  type: :integer,
                  foreign_key: { to_table: :users,
                                 name: 'fk_course_assessment_question_programming_superseder_id' },
                  index: { name: 'fk__course_assessment_question_programming_superseder_id',
                           where: 'superseder_id IS NOT NULL' }
  end
end
