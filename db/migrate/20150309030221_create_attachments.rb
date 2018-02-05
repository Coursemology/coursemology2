# frozen_string_literal: true
class CreateAttachments < ActiveRecord::Migration[4.2]
  def change
    create_table :attachments do |t|
      t.string :name, null: false
      t.references :attachable, polymorphic: true, index: true
      t.text :file_upload, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
