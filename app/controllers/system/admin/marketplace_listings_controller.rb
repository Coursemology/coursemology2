# frozen_string_literal: true
# System-admin view of every marketplace listing — what version is served, how many courses adopted
# it, and whether its source still exists — plus the maintenance actions on a listing off the
# marketplace: restore a source assessment (orphaned only), or delete it permanently.
class System::Admin::MarketplaceListingsController < System::Admin::Controller
  def index
    @listings = Course::Assessment::Marketplace::Listing.for_admin_index
    @adoption_counts = Course::Assessment::Marketplace::Adoption.
                       where(listing_id: @listings.map(&:id)).group(:listing_id).
                       distinct.count(:destination_course_id)
    @authoring_urls = authoring_urls(@listings)
  end

  # The per-listing provenance + history page. Read-only: every mutation stays on the index.
  def show
    @listing = find_listing
    @versions = @listing.versions.ordered.includes(:assessment, :published_by).to_a
    @adoptions = ActsAsTenant.without_tenant do
      @listing.adoptions.includes(destination_course: :instance).order(:created_at).to_a
    end
    @snapshot_urls = snapshot_urls(@versions)
    @authoring_url = authoring_urls([@listing])[@listing.id]
  end

  # The manual repair for a listing that has no authoring copy: duplicates its latest snapshot into
  # the marketplace's own container course and makes that the authoring copy, so "Publish new version"
  # works again.
  #
  # A failsafe rather than the ordinary path: losing a source assessment re-points the listing inside
  # the destroy transaction, so an orphan means that callback was bypassed. Asynchronous — assessment
  # duplication is the same heavy path adopters go through — so the client polls the returned `jobUrl`.
  def restore_authoring
    listing = find_listing
    error = restore_rejection(listing)
    return render json: { errors: [error] }, status: :unprocessable_content if error

    job = Course::Assessment::Marketplace::RestoreAuthoringJob.
          perform_later(listing.id, current_user: current_user).job
    render partial: 'jobs/submitted', locals: { job: job }
  end

  # Takes a listing off the marketplace, or puts it back. Reversible. Admin has to unlist a listing
  # before `destroy` will accept said listing at all.
  #
  # Admin-side rather than the course-side unlist because that one hangs off the authoring assessment,
  # which after a re-point lives in the container course on the preview instance — a course an admin
  # cannot reach from their own host, and one an orphaned listing has no pointer to at all. Re-listing
  # never cuts a version: it restores visibility over the version the listing already holds.
  def update
    listing = find_listing
    error = list_rejection(listing, published_param)
    return render json: { errors: [error] }, status: :unprocessable_content if error

    listing.update!(published: published_param)
    head :ok
  end

  # PERMANENT deletion, not unlisting. Restricted to listings that are off the marketplace.
  def destroy
    listing = find_listing
    return render json: { errors: [purge_rejection(listing)] }, status: :unprocessable_content unless
      listing.purgeable?

    Course::Assessment::Marketplace::PurgeService.purge!(listing)
    head :ok
  end

  # The single canonicalisation both the version rows and the adoption rows go through.
  # @param [ActiveSupport::TimeWithZone, nil] published_at
  # @return [String, nil]
  def self.snapshot_key(published_at)
    published_at&.utc&.iso8601(6)
  end

  private

  # Listings span every instance while their snapshots live in the container's, so every lookup here
  # is tenant-free — the same reason `.for_admin_index` is.
  def find_listing
    ActsAsTenant.without_tenant do
      Course::Assessment::Marketplace::Listing.find(params[:id])
    end
  end

  # `params[:published]` arrives as a JSON boolean from our own client and as a string from anything
  # else, so it goes through the same cast the settings components use.
  # @return [Boolean]
  def published_param
    ActiveRecord::Type::Boolean.new.cast(params[:published])
  end

  # Unlisting is always allowed — it is the reversible step, and it is what an admin reaches for when
  # something is wrong with a listing.
  #
  # @return [String, nil] the reason the change is refused, or nil if it may proceed
  def list_rejection(listing, published)
    return nil unless published
    return 'This listing has no published version to serve.' if listing.current_version_id.nil?

    nil
  end

  # @return [String, nil] the reason the restore is refused, or nil if it may proceed
  def restore_rejection(listing)
    return 'Only an orphaned listing can have its source assessment rebuilt.' unless listing.orphaned?
    return 'This listing has no published version to restore from.' if listing.current_version.nil?

    nil
  end

  # @return [String] the reason the deletion is refused
  def purge_rejection(_listing)
    'A published listing cannot be permanently deleted. Unlist it first.'
  end

  # @return [Hash{String => String}] canonicalised publish date => absolute snapshot url
  def snapshot_urls(versions)
    return {} if versions.empty?

    ActsAsTenant.without_tenant do
      container = Course::Assessment::Marketplace::PreviewContainerService.container_course
      host = container.instance.host

      versions.each_with_object({}) do |version, urls|
        next if version.assessment.nil?

        urls[self.class.snapshot_key(version.published_at)] =
          course_assessment_url(version.assessment.course_id, version.assessment, **host_options(host))
      end
    end
  end

  # An absolute URL carrying the source course's own host, not a path: `Course` is
  # `acts_as_tenant :instance`, so a course id only resolves on its instance's host and a relative
  # path 404s for every listing published from another instance.
  #
  # @return [Hash{Integer => String}] listing id => absolute authoring assessment url
  def authoring_urls(listings)
    ActsAsTenant.without_tenant do
      listings.each_with_object({}) do |listing, urls|
        assessment = listing.authoring_assessment
        next if assessment.nil?

        urls[listing.id] = course_assessment_url(assessment.course_id, assessment,
                                                 **host_options(assessment.course.instance.host))
      end
    end
  end

  # @param [String] host an instance host, optionally carrying a port
  # @return [Hash] the `host:`/`port:` options for a url on that instance
  def host_options(host)
    name, port = host.split(':', 2)
    { host: name, port: port }
  end
end
