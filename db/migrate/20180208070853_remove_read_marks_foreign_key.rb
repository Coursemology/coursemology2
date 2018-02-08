class RemoveReadMarksForeignKey < ActiveRecord::Migration[5.1]
  def change
    remove_foreign_key :read_marks, column: :reader_id
  end
end
