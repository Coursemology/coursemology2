class AddFieldsToCourses < ActiveRecord::Migration[4.2]
  def up
    add_column :courses, :published, :boolean, default: false, null: false
    add_column :courses, :enrollable, :boolean, default: false, null: false

    # Closed
    Course.unscoped.where(status: 0).update_all(enrollable: false, published: false)
    # Published
    Course.unscoped.where(status: 1).update_all(enrollable: false, published: true)
    # Opened
    Course.unscoped.where(status: 2).update_all(enrollable: true, published: true)

    remove_column :courses, :status, :integer, null: false, default: 0
  end
end
