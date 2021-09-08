class CreateCourseConditionSurveys < ActiveRecord::Migration[5.2]
  def change
    create_table :course_condition_surveys do |t|
      t.references :survey, null: false, foreign_key: { to_table: :course_surveys },
                            index: { name: 'fk__course_condition_surveys_survey_id' }
    end
  end
end
