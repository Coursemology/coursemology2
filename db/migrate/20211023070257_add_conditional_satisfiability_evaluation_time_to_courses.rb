class AddConditionalSatisfiabilityEvaluationTimeToCourses < ActiveRecord::Migration[6.0]
  def change
    # The original line (commented) generated the default based on when the migration was run, which
    # caused desync between the schema.rb (based on migration run time in local development) and the actual
    # production schema (based on migration run time in production).
    # To fix this, we set the default value to a fixed time matching the actual production value.
    #
    # add_column :courses, :conditional_satisfiability_evaluation_time, :datetime, default: Time.now
    add_column :courses, :conditional_satisfiability_evaluation_time, :datetime, default: '2021-11-09 00:08:09.279414'
  end
end
