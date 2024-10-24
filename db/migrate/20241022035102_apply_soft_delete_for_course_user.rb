class ApplySoftDeleteForCourseUser < ActiveRecord::Migration[7.2]
  def up
    change_table :course_users do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:course_users, :deleted_at)
      t.index :deleted_at unless index_exists?(:course_users, :deleted_at)
    end

    change_table :courses do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:courses, :deleted_at)
      t.index :deleted_at unless index_exists?(:courses, :deleted_at)
    end

    change_table :course_achievements do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:course_achievements, :deleted_at)
      t.index :deleted_at unless index_exists?(:course_achievements, :deleted_at)
    end
  end

  def down
    change_table :course_users do |t|
      t.remove_index :deleted_at if index_exists?(:course_users, :deleted_at)
      t.remove :deleted_at if column_exists?(:course_users, :deleted_at)
    end

    change_table :courses do |t|
      t.remove_index :deleted_at if index_exists?(:courses, :deleted_at)
      t.remove :deleted_at if column_exists?(:courses, :deleted_at)
    end

    change_table :course_achievements do |t|
      t.remove_index :deleted_at if index_exists?(:course_achievements, :deleted_at)
      t.remove :deleted_at if column_exists?(:course_achievements, :deleted_at)
    end
  end
end
