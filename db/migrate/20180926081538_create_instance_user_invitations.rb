class CreateInstanceUserInvitations < ActiveRecord::Migration[5.1]
  def change
    create_table :instance_user_invitations do |t|
      t.references :instance,          null: false, index: true, type: :integer
      t.string     :name,              null: false, limit: 255
      t.string     :email,             null: false, limit: 255
      t.integer    :role,              null: false, default: 0
      t.string     :invitation_key,    null: false, limit: 32, index: { unique: true }
      t.datetime   :sent_at
      t.datetime   :confirmed_at
      t.integer    :confirmer_id,     foreign_key: { references: :users }
      t.userstamps                    null: false, foreign_key: { references: :users }
      t.timestamps                    null: false
    end

    add_index :instance_user_invitations, 'lower((email)::text)'
    add_index :instance_user_invitations, [:instance_id, :email], unique: true
  end
end
