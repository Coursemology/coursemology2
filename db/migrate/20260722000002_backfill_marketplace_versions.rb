# frozen_string_literal: true
class BackfillMarketplaceVersions < ActiveRecord::Migration[7.2]
  # Data-only. Versions every existing published listing as v1 (snapshotting into
  # the container via the publish service) and stamps adopted_version = 1 on its
  # adoptions. Idempotent — reruns skip already-versioned listings.
  def up
    Course::Assessment::Marketplace::PublishService.backfill_all!
  end

  def down
    # Irreversible: version snapshots are retained.
  end
end
