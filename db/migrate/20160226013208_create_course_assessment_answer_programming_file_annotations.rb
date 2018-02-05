class CreateCourseAssessmentAnswerProgrammingFileAnnotations < ActiveRecord::Migration[4.2]
  def change
    create_table :course_assessment_answer_programming_file_annotations do |t|
      t.references :file, null: false, references: :course_assessment_answer_programming_files
      t.integer :line, null: false
    end
  end
end
