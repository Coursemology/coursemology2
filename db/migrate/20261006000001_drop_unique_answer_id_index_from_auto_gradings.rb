# frozen_string_literal: true
#
# Drops the unique index on course_assessment_answer_auto_gradings.answer_id, so that an answer can have more than
# one grading run. AddNonUniqueAnswerIdIndexToAutoGradings built its replacement.
#
# Dropped concurrently so that grading is not blocked. Interrupted, the drop leaves the index INVALID but still
# enforcing uniqueness; running this again finishes it.
class DropUniqueAnswerIdIndexFromAutoGradings < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  TABLE = :course_assessment_answer_auto_gradings
  INDEX = 'index_course_assessment_answer_auto_gradings_on_answer_id'
  REPLACEMENT = 'idx_course_assessment_answer_auto_gradings_on_answer_id'

  def up
    # Without a valid replacement, every lookup of an answer's grading runs would scan the whole table.
    raise "#{REPLACEMENT} is not valid; run AddNonUniqueAnswerIdIndexToAutoGradings first" unless replacement_valid?

    remove_index TABLE, name: INDEX, algorithm: :concurrently, if_exists: true
  end

  # Rebuilding the unique index fails once any answer has a second grading run, and succeeding would need that
  # history deleted.
  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def replacement_valid?
    select_value("SELECT indisvalid FROM pg_index WHERE indexrelid = to_regclass(#{quote(REPLACEMENT)})") == true
  end
end
