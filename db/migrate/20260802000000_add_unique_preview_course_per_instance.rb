# frozen_string_literal: true
# At most one `preview` container course per instance. PreviewContainerService already provisions it
# as a singleton and every reader keys off the flag alone; this makes that a database invariant.
class AddUniquePreviewCoursePerInstance < ActiveRecord::Migration[7.2]
  def change
    add_index :courses, :instance_id, unique: true, where: 'preview',
              name: 'index_courses_on_instance_id_one_preview'
  end
end
