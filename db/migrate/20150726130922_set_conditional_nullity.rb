# frozen_string_literal: true
class SetConditionalNullity < ActiveRecord::Migration[4.2]
  def change
    change_column_null :course_conditions, :conditional_id, false
    change_column_null :course_conditions, :conditional_type, false
  end
end
