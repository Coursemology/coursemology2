class AddTimestampToTrackableJobs < ActiveRecord::Migration[4.2]
  def change
    change_table :jobs do |t|
      add_column:jobs, :created_at, :datetime
      add_column:jobs, :updated_at, :datetime
    end
  end
end
