class AddDefaultTimelineAlgorithmToCourse < ActiveRecord::Migration[6.0]
  def change
    add_column :courses, :default_timeline_algorithm, :integer, default: 0, null: false # 'fixed' algorithm
  end
end
