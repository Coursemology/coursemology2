# frozen_string_literal: true
class AddExternalAssessmentToGradebookContributions < ActiveRecord::Migration[7.2]
  def change
    add_reference :course_gradebook_contributions, :external_assessment, null: true,
                  foreign_key: { to_table: :course_external_assessments, on_delete: :cascade },
                  index: { unique: true,
                           name: 'index_course_gradebook_contributions_on_external_assessment_id' }

    # Exactly one contributor: either a native tab, or an external assessment.
    add_check_constraint :course_gradebook_contributions,
                         '(tab_id IS NOT NULL) <> (external_assessment_id IS NOT NULL)',
                         name: 'chk_gradebook_contribution_exactly_one_contributor'
  end
end
