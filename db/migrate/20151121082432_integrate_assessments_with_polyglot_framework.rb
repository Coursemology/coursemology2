# frozen_string_literal: true
class IntegrateAssessmentsWithPolyglotFramework < ActiveRecord::Migration[4.2]
  def up
    change_table :course_assessment_question_programming do |t|
      t.references :language, foreign_key: { references: :polyglot_languages }
    end
    remove_column :course_assessment_question_programming, :language

    python27_id = Polyglot::Language::Python::Python2Point7.instance.id
    execute <<-SQL
      UPDATE course_assessment_question_programming SET language_id = #{python27_id}
    SQL

    change_column_null :course_assessment_question_programming, :language_id, false
  end

  def down
    remove_column :course_assessment_question_programming, :language_id
    add_column :course_assessment_question_programming, :language, :string
  end
end
