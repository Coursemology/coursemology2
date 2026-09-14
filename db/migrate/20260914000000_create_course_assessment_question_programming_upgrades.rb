# frozen_string_literal: true
class CreateCourseAssessmentQuestionProgrammingUpgrades < ActiveRecord::Migration[8.1]
  # Tracks a programming question's language upgrade so instructors can monitor, retry and revert it.
  #
  # One row per (question, package) pair rather than per question: a saved package edit can produce a
  # different upgrade outcome, so that state is tracked separately instead of overwriting. Only the
  # row matching the question's *current* attachment is authoritative; rows for superseded packages
  # are inert history.
  def change
    create_table :course_assessment_question_programming_upgrades do |t|
      # The Programming actable, not the upstream Course::Assessment::Question. Everything an upgrade
      # concerns (language_id, attachment, import_job_id) lives here, and it is also the keyspace the
      # question-snapshot work keys on.
      t.references :question, null: false,
                              index: false,
                              foreign_key: { to_table: :course_assessment_question_programming }

      # Content-addressed attachment (attachments.name is the SHA256 digest), not an
      # attachment_reference: a byte-identical re-upload yields a new reference but the same
      # attachment, and must not invalidate this row. Cascade rather than nullify so a deleted
      # attachment cannot produce a NULL that collides with the genuinely attachment-less case.
      t.references :attachment, null: true,
                                index: { name: 'index_programming_upgrades_on_attachment_id' },
                                foreign_key: { to_table: :attachments, on_delete: :cascade }

      # The last known-good language, i.e. the revert target.
      t.references :old_language, null: false,
                                  index: { name: 'index_programming_upgrades_on_old_language_id' },
                                  foreign_key: { to_table: :polyglot_languages }
      t.references :new_language, null: false,
                                  index: { name: 'index_programming_upgrades_on_new_language_id' },
                                  foreign_key: { to_table: :polyglot_languages }

      # The ProgrammingImportJob the upgrade spawned. Nullable and nullify-on-delete because job rows
      # are documented as ephemeral (see TrackableJob).
      t.references :job, type: :uuid, null: true,
                         index: { name: 'index_programming_upgrades_on_job_id' },
                         foreign_key: { to_table: :jobs, on_delete: :nullify }

      t.string :workflow_state, limit: 255, null: false, default: 'pending'

      t.references :creator, null: false,
                             index: { name: 'index_programming_upgrades_on_creator_id' },
                             foreign_key: { to_table: :users }
      t.references :updater, null: false,
                             index: { name: 'index_programming_upgrades_on_updater_id' },
                             foreign_key: { to_table: :users }

      t.datetime :created_at, precision: nil, null: false
      t.datetime :updated_at, precision: nil, null: false
    end

    # NULLS NOT DISTINCT (PostgreSQL 15+) is required: ~10k programming questions have no attachment
    # (non-autograded and online-editor questions). Under the default NULLS DISTINCT, Postgres treats
    # every NULL as unique and those questions could accumulate unbounded rows.
    #
    # question_id leads, so this also serves lookups by question and no separate index is needed.
    add_index :course_assessment_question_programming_upgrades,
              [:question_id, :attachment_id],
              unique: true, nulls_not_distinct: true,
              name: 'index_programming_upgrades_on_question_id_and_attachment_id'
  end
end
