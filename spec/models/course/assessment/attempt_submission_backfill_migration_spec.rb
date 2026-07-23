# frozen_string_literal: true
require 'rails_helper'
require Rails.root.join('db/migrate/20260722000004_create_course_assessment_submissions_extension_table')

RSpec.describe CreateCourseAssessmentSubmissionsExtensionTable, type: :model do
  let(:instance) { Instance.default }

  # Inserts one row straight into course_assessment_attempts (the big Phase-1a table, untouched by
  # this migration) and returns its id — a "pre-existing attempt" for the backfill to copy. Raw SQL
  # rather than the factory so each course-coupled column can be given an exact, asserted value, and
  # so the spec does not depend on the submission model/factory (still mid-rename until Task 2).
  # Every course_assessment_attempts NOT NULL column is set; the columns the migration copies
  # (publisher_id, session_id, last_graded_time, created_at, updated_at) are parameters.
  def insert_attempt(assessment:, creator:, publisher_id: nil, session_id: nil, # rubocop:disable Metrics/ParameterLists
                     last_graded_time: nil, created_at: Time.zone.now, updated_at: Time.zone.now)
    sql = <<-SQL.squish
      INSERT INTO course_assessment_attempts
        (assessment_id, workflow_state, creator_id, updater_id, publisher_id, published_at,
         session_id, submitted_at, last_graded_time, created_at, updated_at)
      VALUES
        (?, 'submitted', ?, ?, ?, NULL, ?, now(), ?, ?, ?)
      RETURNING id
    SQL
    ActiveRecord::Base.connection.select_value(
      ActiveRecord::Base.sanitize_sql_array(
        [sql, assessment.id, creator.id, creator.id, publisher_id, session_id,
         last_graded_time, created_at, updated_at]
      )
    ).to_i
  end

  # This spec drives the migration's own `down`/`up`. RSpec's `maintain_test_schema!` always brings
  # the test DB to schema.rb's FINAL state, so `course_assessment_submissions` already exists when an
  # example starts; the `around` hook drops it (`down`) BEFORE each example so the body can test `up`
  # creating + backfilling it from scratch, then restores it afterwards.
  #
  # Consequence (caught by the plan-time Test Review Gate, and the reason no example here uses a
  # `change {}` matcher): since `down` has already dropped the table when the body begins, an
  # example must NOT write `expect { up }.to change { SELECT ... FROM course_assessment_submissions }`
  # — `change` evaluates its value block once BEFORE `up`, i.e. against a table that does not exist
  # yet, raising `PG::UndefinedTable`. Every example therefore calls `up` first, sets
  # `@migration_reapplied`, then asserts on the resulting rows. Row counts are scoped to a
  # freshly-created `attempt_id`, so they are deterministically 1 after `up` and safe under this
  # repo's "nothing rolls back between examples" convention.
  #
  # `@migration_reapplied` guards against double-calling `up` (once in the example, once in the
  # `ensure`), which would crash trying to rename onto a table that already exists.
  around do |example|
    described_class.new.down
    example.run
  ensure
    described_class.new.up unless @migration_reapplied
  end

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:creator) { create(:course_student, course: course).user }

    it 'backfills one submission row per pre-existing attempt, copying every ' \
       'course-coupled column with its exact value' do
      publisher = create(:course_student, course: course).user
      graded_time = Time.zone.parse('2026-01-02 03:04:05')
      created_time = Time.zone.parse('2020-06-15 08:00:00')
      updated_time = Time.zone.parse('2021-07-16 09:30:00')
      attempt_id = insert_attempt(assessment: assessment, creator: creator,
                                  publisher_id: publisher.id, session_id: 'a-fake-session-id',
                                  last_graded_time: graded_time,
                                  created_at: created_time, updated_at: updated_time)

      described_class.new.up
      @migration_reapplied = true

      rows = ActiveRecord::Base.connection.select_all(
        "SELECT * FROM course_assessment_submissions WHERE attempt_id = #{attempt_id}"
      ).to_a
      expect(rows.size).to eq(1)
      row = rows.first
      expect(row['publisher_id'].to_i).to eq(publisher.id)
      expect(row['session_id']).to eq('a-fake-session-id')
      expect(row['last_graded_time']).to eq(graded_time)
      expect(row['created_at']).to eq(created_time)
      expect(row['updated_at']).to eq(updated_time)
    end

    it 'copies a NULL publisher_id through as NULL' do
      attempt_id = insert_attempt(assessment: assessment, creator: creator,
                                  publisher_id: nil, session_id: 'null-publisher-session',
                                  last_graded_time: Time.zone.now)

      described_class.new.up
      @migration_reapplied = true

      row = ActiveRecord::Base.connection.select_one(
        "SELECT * FROM course_assessment_submissions WHERE attempt_id = #{attempt_id}"
      )
      expect(row['publisher_id']).to be_nil
    end

    it 'backfills every pre-existing attempt, not only the most recently created one' do
      older_id = insert_attempt(assessment: assessment, creator: creator, session_id: 'older')
      newer_creator = create(:course_student, course: course).user
      newer_id = insert_attempt(assessment: assessment, creator: newer_creator, session_id: 'newer')

      described_class.new.up
      @migration_reapplied = true

      counts = [older_id, newer_id].map do |id|
        ActiveRecord::Base.connection.select_value(
          "SELECT COUNT(*) FROM course_assessment_submissions WHERE attempt_id = #{id}"
        ).to_i
      end
      expect(counts).to eq([1, 1])
    end

    it 'enforces one submission row per attempt (unique attempt_id)' do
      attempt_id = insert_attempt(assessment: assessment, creator: creator, session_id: 'unique')

      described_class.new.up
      @migration_reapplied = true

      expect do
        ActiveRecord::Base.connection.execute(
          'INSERT INTO course_assessment_submissions (attempt_id, created_at, updated_at) ' \
          "VALUES (#{attempt_id}, now(), now())"
        )
      end.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end
end
