class AddKoditsuColumns < ActiveRecord::Migration[7.0]
  def change
    add_column :courses, :koditsu_workspace_id, :string

    # for assessment
    add_column :course_assessments, :koditsu_assessment_id, :string
    add_column :course_assessments, :is_koditsu_enabled, :boolean
    add_column :course_assessments, :is_synced_with_koditsu, :boolean, null: false, default: false

    # for question
    add_column :course_assessment_questions, :koditsu_question_id, :string
    add_column :course_assessment_questions, :is_synced_with_koditsu, :boolean, null: false, default: false
  end
end
