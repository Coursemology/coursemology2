class ApplySoftDeleteForCourseUserAndAssociatedModels < ActiveRecord::Migration[7.2]
  def change
    change_table :course_users do |t|
      t.datetime :deleted_at, default: nil
      t.index :deleted_at
    end

    change_table :course_experience_points_records do |t|
      t.datetime :deleted_at, default: nil
      t.index :deleted_at
    end

    change_table :course_learning_rate_records do |t|
      t.datetime :deleted_at, default: nil
      t.index :deleted_at
    end

    change_table :course_user_achievements do |t|
      t.datetime :deleted_at, default: nil
      t.index :deleted_at
    end

    change_table :course_user_email_unsubscriptions do |t|
      t.datetime :deleted_at, default: nil
      t.index :deleted_at
    end

    change_table :course_group_users do |t|
      t.datetime :deleted_at, default: nil
      t.index :deleted_at
    end

    change_table :course_personal_times do |t|
      t.datetime :deleted_at, default: nil
      t.index :deleted_at
    end
  end
end
