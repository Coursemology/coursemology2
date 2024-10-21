class ApplySoftDeleteForCourseUserAndAssociatedModels1 < ActiveRecord::Migration[7.2]
  def change
    change_table :course_users do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:course_users, :deleted_at)
      t.index :deleted_at unless index_exists?(:course_users, :deleted_at)
    end

    change_table :course_experience_points_records do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:course_experience_points_records, :deleted_at)
      t.index :deleted_at unless index_exists?(:course_experience_points_records, :deleted_at)
    end

    change_table :course_learning_rate_records do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:course_learning_rate_records, :deleted_at)
      t.index :deleted_at unless index_exists?(:course_learning_rate_records, :deleted_at)
    end

    change_table :course_user_achievements do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:course_user_achievements, :deleted_at)
      t.index :deleted_at unless index_exists?(:course_user_achievements, :deleted_at)
    end

    change_table :course_user_email_unsubscriptions do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:course_user_email_unsubscriptions, :deleted_at)
      t.index :deleted_at unless index_exists?(:course_user_email_unsubscriptions, :deleted_at)
    end

    change_table :course_group_users do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:course_group_users, :deleted_at)
      t.index :deleted_at unless index_exists?(:course_group_users, :deleted_at)
    end

    change_table :course_personal_times do |t|
      t.datetime :deleted_at, default: nil unless column_exists?(:course_personal_times, :deleted_at)
      t.index :deleted_at unless index_exists?(:course_personal_times, :deleted_at)
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
end
