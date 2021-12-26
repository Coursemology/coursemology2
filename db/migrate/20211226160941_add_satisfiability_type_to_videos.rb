class AddSatisfiabilityTypeToVideos < ActiveRecord::Migration[6.0]
  def change
    add_column :course_videos, :satisfiability_type, :integer, default: 0
  end
end
