# frozen_string_literal: true
#
# Marks a v2 rubric record (Course::Rubric and its Category/Criterion children) as copy-on-write:
# once persisted its content is immutable, and the only way to "change" a rubric is to create a new
# record. Editing flows therefore call Course::Rubric#copy_with, which returns the same record when
# the proposed content is unchanged or a freshly persisted record otherwise.
#
# Each including model must implement #canonical_content, returning a plain Ruby Hash/Array tree of
# the content that identifies the record (no ActiveRecord objects). #canonical_content_hash digests
# that tree; Course::Rubric persists the digest in its content_hash column for O(1) comparisons.
#
# NOTE: the immutability guard hooks before_update, so callbackless writers (update_column,
# update_columns, update_all) deliberately bypass it -- they are reserved for internal/migration use.
module Course::Rubric::CopyOnWriteConcern
  extend ActiveSupport::Concern

  included do
    before_update :raise_copy_on_write_violation
  end

  # SHA-256 of the canonical content tree. Must stay byte-compatible with the migration that backfills
  # content_hash (see db/migrate/*_add_content_hash_weight_and_active_rubric.rb#content_hash_for), so
  # equal content always yields an equal digest across both code paths.
  def canonical_content_hash
    Digest::SHA256.hexdigest(canonical_content.to_json)
  end

  private

  def raise_copy_on_write_violation
    raise ActiveRecord::ReadOnlyRecord,
          "#{self.class.name} is copy-on-write; create a new record via #copy_with instead of updating."
  end
end
