# frozen_string_literal: true
class AddMarketplaceContainerToCourses < ActiveRecord::Migration[7.2]
  def change
    add_column :courses, :marketplace_container, :boolean, null: false, default: false

    # At most one container per instance, enforced by the DB rather than by a title lookup.
    add_index :courses, :instance_id, unique: true, where: 'marketplace_container',
              name: 'index_courses_on_instance_id_marketplace_container'
  end
end
