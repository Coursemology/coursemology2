class CreateCourseAssessmentLinks < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_links do |t|
      t.references :assessment, null: false, foreign_key: { to_table: :course_assessments }, index: true
      t.references :linked_assessment, null: false, foreign_key: { to_table: :course_assessments }, index: true
    end

    add_index :course_assessment_links, [:assessment_id, :linked_assessment_id], unique: true
  end
end