# frozen_string_literal: true
class AddRemindedAtAndAllowResponseeToSurveys < ActiveRecord::Migration
  def change
    add_column :course_surveys, :closing_reminded_at, :datetime
    rename_column :course_surveys, :allow_modify, :allow_modify_after_submit
    add_column :course_surveys, :allow_response_after_end, :bool, null: false, default: false
  end
end
