class AddShowPersonalizedTimelineFeaturesToCourse < ActiveRecord::Migration[5.2]
  def change
    add_column :courses, :show_personalized_timeline_features, :boolean, default: false, null: false
  end
end
