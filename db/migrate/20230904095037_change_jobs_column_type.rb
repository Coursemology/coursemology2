class ChangeJobsColumnType < ActiveRecord::Migration[6.0]
  def change
    change_column :jobs, :redirect_to, :text
  end
end
