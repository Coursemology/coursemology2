class CreateCourseAssessmentSkillsQuestionAssessments < ActiveRecord::Migration[5.1]
  def up
    create_table :course_assessment_skills_question_assessments do |t|
      t.integer :question_assessment_id, references: :course_question_assessments, null: false,
                index: {name: 'index_course_assessment_skills_question_assessments_on_qa_id'}
      t.integer :skill_id, references: :course_assessment_skills, null: false, index: true
    end

    add_index :course_assessment_skills_question_assessments, [:question_assessment_id, :skill_id],
              unique: true, name: 'index_skills_qn_assessments_on_qa_id_and_skill_id'
    add_foreign_key :course_assessment_skills_question_assessments, :course_assessment_skills,
                    column: :skill_id
    add_foreign_key :course_assessment_skills_question_assessments, :course_question_assessments,
                    column: :question_assessment_id

    # migrate the question <-> skills data
    execute <<-SQL
      INSERT INTO course_assessment_skills_question_assessments(question_assessment_id, skill_id)
        SELECT cqa.id, skill_id FROM course_assessment_questions_skills caqs INNER JOIN course_question_assessments cqa
          ON caqs.question_id = cqa.question_id
    SQL

    drop_table :course_assessment_questions_skills
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
