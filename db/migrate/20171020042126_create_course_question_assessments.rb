class CreateCourseQuestionAssessments < ActiveRecord::Migration[5.0]
  def up
    create_table :course_question_assessments do |t|
      t.integer :question_id, references: :course_assessment_questions, null: false, index: true
      t.integer :assessment_id, references: :course_assessments, null: false, index: true
      t.integer :weight, null: false
    end

    Course::Assessment::Question.find_each do |question|
      Course::QuestionAssessment.new(
          question_id: question.id,
          assessment_id: question.assessment_id,
          weight: question.weight
      ).save!(validate: false)
    end

    add_index :course_question_assessments, [:question_id, :assessment_id],
              unique: true, name: 'index_question_assessments_on_question_id_and_assessment_id'

    remove_column :course_assessment_questions, :assessment_id
    remove_column :course_assessment_questions, :weight
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
