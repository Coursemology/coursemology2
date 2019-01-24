class AddRandomizedAssessmentTables < ActiveRecord::Migration[5.2]
  def change
    # course_assessments
    add_column :course_assessments, :randomization, :integer, index: true, default: nil

    # course_assessment_question_groups
    create_table :course_assessment_question_groups do |t|
      t.string :title, null: false
      t.references :assessment, null: false, index: true, foreign_key: { to_table: :course_assessments }
      t.integer :weight, null: false
    end

    # course_assessment_question_bundles
    create_table :course_assessment_question_bundles do |t|
      t.string :title, null: false
      t.references :group, null: false, index: true, foreign_key: { to_table: :course_assessment_question_groups }
    end

    # course_assessment_question_bundle_questions
    create_table :course_assessment_question_bundle_questions do |t|
      t.references :bundle, null: false, index: true, foreign_key: { to_table: :course_assessment_question_bundles }
      t.references :question, null: false, foreign_key: { to_table: :course_assessment_questions },
                              index: { name: 'idx_course_assessment_question_bundle_questions_on_q_id' }
      t.integer :weight, null: false
      t.index [:bundle_id, :question_id], unique: true,
                                          name: 'idx_course_assessment_question_bundle_questions_on_b_and_q_id'
    end

    # course_assessment_question_bundle_assignments
    create_table :course_assessment_question_bundle_assignments do |t|
      t.references :user, null: false, index: true, foreign_key: { to_table: :users }
      t.references :assessment, null: false, foreign_key: { to_table: :course_assessments },
                                index: { name: 'idx_course_assessment_question_bundle_assignments_on_assmt_id' }
      t.references :submission, foreign_key: { to_table: :course_assessment_submissions },
                                index: { name: 'idx_course_assessment_question_bundle_assignments_on_sub_id' }
      t.references :bundle, null: false, foreign_key: { to_table: :course_assessment_question_bundles },
                            index: { name: 'idx_course_assessment_question_bundle_assignments_on_bundle_id' }
    end
  end
end
