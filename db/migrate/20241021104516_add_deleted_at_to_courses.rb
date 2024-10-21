class AddDeletedAtToCourses < ActiveRecord::Migration[7.2]
  def change
    add_column :courses, :deleted_at, :datetime
    add_index :courses, :deleted_at
  end
end
