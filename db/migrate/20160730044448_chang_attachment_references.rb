class ChangAttachmentReferences < ActiveRecord::Migration[4.2]
  def change
    add_column :attachment_references, :uuid, :uuid, default: 'uuid_generate_v4()', null: false

    change_table :attachment_references do |t|
      t.remove :id
      t.rename :uuid, :id
    end
    execute 'ALTER TABLE attachment_references ADD PRIMARY KEY (id);'
  end
end
