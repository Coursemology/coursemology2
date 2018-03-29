class RenameComprehensionExplanationToInformation < ActiveRecord::Migration[5.1]
  def up
    rename_column :course_assessment_question_text_response_compre_solutions,
                  :explanation,
                  :information
    change_column :course_assessment_question_text_response_compre_solutions,
                  :information,
                  :string
  end

  def down
    change_column :course_assessment_question_text_response_compre_solutions,
                  :information,
                  :text
    rename_column :course_assessment_question_text_response_compre_solutions,
                  :information,
                  :explanation
  end
end
