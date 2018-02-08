class AddTimezoneToCourses < ActiveRecord::Migration[5.1]
  def change
    add_column :courses, :time_zone, :string, limit: 255

    # Initialize course time zone as course creator's time zone.
    ActsAsTenant.without_tenant do
      Course.find_each do |course|
        course.update_column(:time_zone, course.creator.time_zone)
      end
    end
  end
end
