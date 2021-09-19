class AddSatisfiabilityTypeToAchievementsAndAssessments < ActiveRecord::Migration[5.2]
  def change
    add_column :course_achievements, :satisfiability_type, :integer, default: 0
    add_column :course_assessments, :satisfiability_type, :integer, default: 0
  end
end
