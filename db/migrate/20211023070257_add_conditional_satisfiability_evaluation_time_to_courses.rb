class AddConditionalSatisfiabilityEvaluationTimeToCourses < ActiveRecord::Migration[6.0]
  def change
    add_column :courses, :conditional_satisfiability_evaluation_time, :datetime, default: Time.now
  end
end
