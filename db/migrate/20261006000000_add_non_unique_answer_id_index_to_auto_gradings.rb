# frozen_string_literal: true
#
# Builds a non-unique index on course_assessment_answer_auto_gradings.answer_id, to replace the unique one that
# DropUniqueAnswerIdIndexFromAutoGradings removes so that an answer can have more than one grading run.
#
# Built concurrently so that grading is not blocked while it builds, which takes minutes on a production-sized
# table. A concurrent build is not atomic: interrupted, it leaves an INVALID index of this name behind, which
# `if_not_exists: true` would accept as done. An invalid index is therefore dropped and built again.
#
# Before running: check pg_stat_activity for long-running transactions, read-only ones included, as the build
# waits for them; and that no statement timeout applies to the migrating role.
class AddNonUniqueAnswerIdIndexToAutoGradings < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  TABLE = :course_assessment_answer_auto_gradings
  INDEX = 'idx_course_assessment_answer_auto_gradings_on_answer_id'

  def up
    remove_index TABLE, name: INDEX, algorithm: :concurrently if index_state == :invalid
    add_index TABLE, :answer_id, name: INDEX, algorithm: :concurrently unless index_state == :valid
    raise "#{INDEX} was not built" unless index_state == :valid
  end

  def down
    remove_index TABLE, name: INDEX, algorithm: :concurrently, if_exists: true
  end

  private

  # @return [Symbol] :valid, :invalid, or :absent.
  def index_state
    valid = select_value("SELECT indisvalid FROM pg_index WHERE indexrelid = to_regclass(#{quote(INDEX)})")
    return :absent if valid.nil?

    valid ? :valid : :invalid
  end
end
