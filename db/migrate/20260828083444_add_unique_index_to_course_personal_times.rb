class AddUniqueIndexToCoursePersonalTimes < ActiveRecord::Migration[8.1]
  def change
    # There is at most one personal time per (course_user, lesson_plan_item) pair. This was only ever
    # enforced by a model-level uniqueness validation (a check-then-insert), which two concurrent
    # personalized-timeline writers can both pass, each inserting a row. Back the invariant with a
    # database unique index so the losing writer's transaction fails instead of silently duplicating.
    add_index :course_personal_times, [:course_user_id, :lesson_plan_item_id],
              unique: true, name: 'index_course_personal_times_on_user_and_item'

    # The composite index above leads with course_user_id, so it serves every lookup the standalone
    # course_user_id index did. Drop the now-redundant single-column index.
    remove_index :course_personal_times, :course_user_id,
                 name: 'index_course_personal_times_on_course_user_id'
  end
end
