# frozen_string_literal: true
class NormaliseProgrammingQuestionFileNames < ActiveRecord::Migration[4.2]
  def change
    remove_index :course_assessment_answer_programming_files,
                 name: :index_course_assessment_answer_programming_files_filename
    add_index :course_assessment_answer_programming_files, [:answer_id, :filename],
              name: :index_course_assessment_answer_programming_files_filename,
              unique: true, case_sensitive: false

    add_index :course_assessment_question_programming_template_files, [:question_id, :filename],
              name: :index_course_assessment_question_programming_template_filenames,
              unique: true, case_sensitive: false
  end
end
