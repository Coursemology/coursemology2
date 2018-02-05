class CreateAttachmentReferences < ActiveRecord::Migration[4.2]
  def change
    create_table :attachment_references do |t|
      t.references :attachable, polymorphic: true
      t.references :attachment, null: false
      t.string :name, null: false
      t.datetime :expires_at

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    remove_column :attachments, :attachable_id, :integer
    remove_column :attachments, :attachable_type, :string
    remove_column :attachments, :creator_id, :integer
    remove_column :attachments, :updater_id, :integer
    add_index :attachments, :name, unique: true
  end
end
