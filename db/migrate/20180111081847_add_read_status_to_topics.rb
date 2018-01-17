# This migration initialises the read/unread models for Course::Discussion::Topic.
class AddReadStatusToTopics < ActiveRecord::Migration[5.1]
  def up
    # Declare all Course::Discussion::Topic read for each user.
    #
    # This does not affect Forums because ReadMarks are declared on those
    # models rather than on Course::Discussion::Topic.
    execute <<-SQL
      INSERT INTO read_marks(readable_type, reader_id, timestamp, reader_type)
        SELECT 'Course::Discussion::Topic', id, NOW(), 'User' FROM users
    SQL
  end

  def down
    ReadMark.where(readable_id: nil, readable_type: Course::Discussion::Topic.name).delete_all
  end
end
