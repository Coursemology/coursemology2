# frozen_string_literal: true
# System-admin view of every marketplace listing — what version is served, how many courses adopted
# it, and whether its source still exists — plus the maintenance actions on a listing off the
# marketplace: restore a source assessment (orphaned only), or delete it permanently (design §5.3).
#
# `System::Admin::Controller` applies `before_action :authorize_admin` (`authorize!(:manage, :all)`),
# which is the entire authorization story here. An ability check on the listing would not do: CanCan's
# `:manage` wildcard subsumes every custom action, and course managers hold a blanket
# `can :manage, Course`, so these must stay behind `:manage, :all`.
class System::Admin::MarketplaceListingsController < System::Admin::Controller
  def index
    @listings = Course::Assessment::Marketplace::Listing.for_admin_index
    @adoption_counts = Course::Assessment::Marketplace::Adoption.
                       where(listing_id: @listings.map(&:id)).group(:listing_id).
                       distinct.count(:destination_course_id)
    @authoring_urls = authoring_urls(@listings)
  end

  # The per-listing provenance + history page (design §4). Read-only: every mutation stays on the
  # index. This is the ONLY index into the container course — publishing copies the assessment title
  # verbatim into a single shared tab, so version identity exists nowhere but the join table.
  def show
    @listing = find_listing
    @versions = @listing.versions.ordered.includes(:assessment, :published_by).to_a
    @adoptions = ActsAsTenant.without_tenant do
      @listing.adoptions.includes(destination_course: :instance).order(:created_at).to_a
    end
    @snapshot_urls = snapshot_urls(@versions)
    # The one entrance to the copy an admin edits. The index row reaches it from the Actions column;
    # this page had no route to it at all, which for a rebuilt listing means no route to the only
    # editable assessment it has.
    @authoring_url = authoring_urls([@listing])[@listing.id]
  end

  # Duplicates the listing's latest snapshot into the marketplace's own container course as a new,
  # editable assessment and makes it the authoring copy, so "Publish new version" works again. There
  # is no destination to choose: the container is the only correct one. Asynchronous — assessment
  # duplication is the same heavy path adopters go through — so the client polls the returned `jobUrl`.
  def restore_authoring
    listing = find_listing
    error = restore_rejection(listing)
    return render json: { errors: [error] }, status: :unprocessable_content if error

    job = Course::Assessment::Marketplace::RestoreAuthoringJob.
          perform_later(listing.id, current_user: current_user).job
    render partial: 'jobs/submitted', locals: { job: job }
  end

  # Takes a listing off the marketplace, or puts it back — the reversible step, and the one an admin
  # has to take before `destroy` will accept a listing at all.
  #
  # It duplicates the course-side `MarketplaceListingsController#destroy` rather than reusing it
  # because that action resolves the listing through its authoring assessment, which an orphaned
  # listing has none of. Re-listing does not go through `PublishService.publish` for the same reason,
  # and because re-listing must not cut a version — a round trip would mint a vintage nobody published.
  #
  # `published` is the ONLY writable attribute. Everything else on a listing is either provenance,
  # which is historical fact, or version state, which the publish path owns.
  def update
    listing = find_listing
    error = list_rejection(listing, published_param)
    return render json: { errors: [error] }, status: :unprocessable_content if error

    listing.update!(published: published_param)
    head :ok
  end

  # PERMANENT deletion, not unlisting. See Course::Assessment::Marketplace::PurgeService for why it
  # is restricted to listings that are off the marketplace — orphaned or unlisted.
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
  # something is wrong with a listing. Only LISTING is gated: a listing with no version has nothing to
  # serve, so putting it on the marketplace would advertise an empty shelf. An orphan, by contrast, is
  # perfectly listable — it goes on serving the snapshot it already holds.
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

  # tenant-free because the container sits in an instance that is never the caller's.
  #
  # Keyed by a CANONICALISED timestamp string rather than a raw Time: hash lookup is by value
  # equality, and any precision difference between two Time objects silently misses. Both sides read
  # `datetime` columns of the same precision written from the same value, so the strings match
  # exactly; a mismatch degrades to a null link rather than an error.
  #
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

  # Precomputed here rather than in the view (app/CLAUDE.md keeps logic out of jbuilder), and keyed
  # off `course_id` rather than the `course` association for the path segment: the listings are
  # loaded without a tenant, where the acting-as `course` association does not resolve and the path
  # helper would receive nil.
  #
  # An absolute URL carrying the source course's own host, not a path: `Course` is
  # `acts_as_tenant :instance`, so a course id only resolves on its instance's host and a relative
  # path 404s for every listing published from another instance. The loop runs tenant-free so the
  # cross-instance `course` (preloaded by `.for_admin_index`) resolves at all.
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

  # `Instance#host` carries the port the app is publicly served on, and that port must be named
  # explicitly: a controller's `url_options` always supplies `port: request.optional_port`, and Rails
  # reads a port out of `host:` only when no `:port` key is present — so passing the host alone
  # silently swaps in the port the request reached Rails on.
  #
  # The two differ whenever a proxy sits in front, i.e. every development setup, and the link then
  # names a port the browser cannot reach. A host with no port yields `port: nil`, which is what
  # production wants. Jobs and mailers escape this: no request, hence no `:port` key.
  #
  # @param [String] host an instance host, optionally carrying a port
  # @return [Hash] the `host:`/`port:` options for a url on that instance
  def host_options(host)
    name, port = host.split(':', 2)
    { host: name, port: port }
  end
end
