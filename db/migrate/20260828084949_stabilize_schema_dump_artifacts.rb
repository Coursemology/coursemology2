class StabilizeSchemaDumpArtifacts < ActiveRecord::Migration[8.1]
  # Two pre-existing objects whose Rails 8.1 schema.rb rendering is unstable (it flips depending on
  # whether a database was built by running migrations or by `db:schema:load`). Both are semantically
  # unchanged here; we only pin them to their dumper-stable form so schema.rb stops drifting.

  # 1. The id sequence of course_assessment_answer_programming_test_results kept a truncated name from
  #    an old table rename, so it no longer matches the `<table>_id_seq` convention and the PK dumps as
  #    an explicit `nextval(...)` default instead of `id: :serial`. Renaming is catalog-only; the
  #    column default references the sequence by OID and follows the rename automatically.
  OLD_SEQUENCE = 'course_assessment_answer_programming_auto_grading_test_r_id_seq'
  NEW_SEQUENCE = 'course_assessment_answer_programming_test_results_id_seq'

  # 2. A partial unique index whose predicate was written as `evaluation_type IN (...)`. Postgres
  #    normalises IN to a whole-array cast that pg_get_expr renders one way from the migration and
  #    another way after a schema.rb round-trip. The per-element form below is a fixed point of that
  #    round-trip, so we recreate the index with it.
  RUBRIC_INDEX = 'index_course_rubric_playground_evaluation_on_answer_rubric'
  PLAYGROUND_PREDICATE_STABLE =
    "((evaluation_type)::text = ANY (ARRAY[('playground'::character varying)::text, " \
    "('playground_hidden'::character varying)::text]))"
  PLAYGROUND_PREDICATE_ORIGINAL = "evaluation_type IN ('playground', 'playground_hidden')"

  def up
    rename_sequence(OLD_SEQUENCE, NEW_SEQUENCE)
    recreate_playground_index(PLAYGROUND_PREDICATE_STABLE)
  end

  def down
    rename_sequence(NEW_SEQUENCE, OLD_SEQUENCE)
    recreate_playground_index(PLAYGROUND_PREDICATE_ORIGINAL)
  end

  private

  # Only rename when the source name is present: databases built via `db:schema:load` already carry the
  # conventional sequence name, so there is nothing to rename there.
  def rename_sequence(from, to)
    return unless connection.select_value(
      "SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = #{connection.quote(from)}"
    )

    execute("ALTER SEQUENCE #{from} RENAME TO #{to}")
  end

  def recreate_playground_index(predicate)
    remove_index :course_rubric_answer_evaluations, name: RUBRIC_INDEX
    add_index :course_rubric_answer_evaluations, [:answer_id, :rubric_id],
              unique: true, where: predicate, name: RUBRIC_INDEX
  end
end
