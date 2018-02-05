class AddUniqueIndexToReadMarks < ActiveRecord::Migration[4.2]
  def change
    remove_duplicates
    remove_index :read_marks, name: :read_marks_reader_readable_index
    add_index :read_marks, [:reader_id, :reader_type, :readable_type, :readable_id],
              unique: true, name: :read_marks_reader_readable_index
  end

  def remove_duplicates
    grouped = ReadMark.
              all.group_by { |rm| [rm.reader_id, rm.reader_type, rm.readable_type, rm.readable_id] }
    grouped.values.each do |duplicates|
      duplicates.pop # Keep last one
      duplicates.each(&:destroy)
    end
  end
end
