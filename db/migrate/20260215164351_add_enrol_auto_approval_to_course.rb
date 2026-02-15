class AddEnrolAutoApprovalToCourse < ActiveRecord::Migration[7.2]
  def change
    add_column :courses, :enrol_auto_approve, :boolean, default: false, null: false
  end
end
