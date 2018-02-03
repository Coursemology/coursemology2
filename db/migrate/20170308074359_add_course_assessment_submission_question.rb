class AddCourseAssessmentSubmissionQuestion < ActiveRecord::Migration[4.2]
  def change
    create_table :course_assessment_submission_questions do |t|
      t.references :submission, foreign_key: { references: :course_assessment_submissions },
                                null: false
      t.references :question, foreign_key: { references: :course_assessment_questions }, null: false

      t.timestamps null: false
    end
    add_index :course_assessment_submission_questions, [:submission_id, :question_id],
              unique: true, name: 'idx_course_assessment_submission_questions_on_sub_and_qn'
  end
end
