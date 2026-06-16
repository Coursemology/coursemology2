class AddKeepHighestToCourseGradebookTabContributionTable < ActiveRecord::Migration[7.2]
  def change
    add_column :course_gradebook_tab_contributions, :keep_highest, :integer, null: false, default: 0
  end
end
