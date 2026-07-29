# frozen_string_literal: true
class Course::Assessment::Marketplace::DuplicationJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  queue_as :duplication

  # Mirrors `validates :title, length: { maximum: 255 }` on Course::LessonPlan::Item, which is where
  # an assessment's title actually lives.
  TITLE_LIMIT = 255

  protected

  def perform_tracked(listing_ids, destination_course, destination_tab_id, options = {})
    current_user = options[:current_user]
    ActsAsTenant.without_tenant do
      listings = Course::Assessment::Marketplace::Listing.published.where(id: listing_ids)
      copies = listings.map do |listing|
        copy = duplicate_listing(listing, destination_course, current_user)
        reparent_into_tab(copy, destination_course, destination_tab_id)
        resolve_title_collision(copy, listing, destination_course)
        record_adoption(listing, destination_course, copy, current_user)
        copy
      end
      landing_url = landing_url_for(copies, destination_course)
      redirect_to landing_url if landing_url
    end
  end

  private

  def duplicate_listing(listing, destination_course, current_user)
    # The SNAPSHOT (design §4.2). `source.course` is therefore the hidden container course, which is
    # exactly what `duplicate_objects` needs as its source course.
    source = listing.current_version.assessment
    copy = Course::Duplication::ObjectDuplicationService.duplicate_objects(
      source.course, destination_course, source, current_user: current_user
    )
    # An adopted copy is a standalone assessment, not a link-sibling of the container snapshot and
    # of every other adopter's copy. See Course::Assessment#detach_from_link_tree!.
    copy.detach_from_link_tree!
    copy
  end

  def reparent_into_tab(copy, destination_course, destination_tab_id)
    target_tab = destination_course.assessment_categories.
                 flat_map(&:tabs).find { |tab| tab.id == destination_tab_id }
    return unless target_tab && copy.tab_id != target_tab.id

    copy.tab = target_tab
    copy.folder.parent = target_tab.category.folder
    copy.save!
  end

  # Renames an imported copy whose title is already taken in the destination course.
  #
  # Fires on every import, not only on re-import of the same listing: a copy landing on top of an
  # unrelated assessment of the same name collides just as badly, and previously landed silently.
  #
  # Escalates only as far as it has to:
  #   "Lab 3"  ->  "Lab 3 [12 Jun 2026]"  ->  "Lab 3 [12 Jun 2026] (2)"  ->  (3) ...
  #
  # The date is the content's vintage, read from the same `ListingVersion#published_at` the adopter
  # update banner uses, so the two can never disagree; `%d %b %Y` matches the frontend's
  # `formatLongDate`. It renders in the app's `Time.zone` while the banner renders in the browser's, so
  # near midnight they can name adjacent days — accepted, the stamp only tells two rows apart.
  #
  # The base title comes from the immutable container snapshot, never from the previous copy, so
  # repeated re-imports cannot compound the suffix.
  #
  # @param [Course::Assessment] copy
  # @param [Course::Assessment::Marketplace::Listing] listing
  # @param [Course] destination_course
  # @return [void]
  def resolve_title_collision(copy, listing, destination_course)
    taken = Course::Assessment.titles_in_course(destination_course, except_id: copy.id)
    base = copy.title
    return if taken.exclude?(base.downcase)

    published_at = ActsAsTenant.without_tenant { listing.current_version&.published_at }
    # A listing with no recorded vintage has nothing to name, so it goes straight to the counter —
    # stamping an empty "[]" would be worse than the collision it is trying to resolve.
    dated = published_at ? "#{base} [#{published_at.strftime('%d %b %Y')}]" : base
    candidate = truncate_to_limit(dated, base)

    suffix_number = 2
    while taken.include?(candidate.downcase)
      candidate = truncate_to_limit("#{dated} (#{suffix_number})", base)
      suffix_number += 1
    end

    copy.title = candidate
    copy.save!
  end

  # Truncate the BASE, never the suffix: an over-long title fails validation on save, and a suffix
  # cut in half no longer distinguishes anything.
  #
  # @param [String] candidate
  # @param [String] base
  # @return [String]
  def truncate_to_limit(candidate, base)
    return candidate if candidate.length <= TITLE_LIMIT

    suffix = candidate.delete_prefix(base)
    base.truncate(TITLE_LIMIT - suffix.length) + suffix
  end

  # Where the completion toast's link sends the manager.
  #
  # A single copy links to the copy: after "Import latest version" the next move is to look at what
  # landed, and the tab index cannot tell the fresh copy from the one it supersedes. A bulk
  # duplication has no single destination, so it keeps the index — but sourced from the copy's OWN
  # tab, not `assessment_categories.first`, which is the destination tab's category only by accident.
  #
  # Reading the tab off the copy rather than trusting `destination_tab_id` also covers the case where
  # `reparent_into_tab` declined to move it (an unknown or zero tab id): the link still points at
  # wherever the copies really are.
  #
  # @param [Array<Course::Assessment>] copies
  # @param [Course] destination_course
  # @return [String, nil] nil when every listing was filtered out by `.published`, in which case
  #   nothing landed and there is nowhere to link to.
  def landing_url_for(copies, destination_course)
    return nil if copies.empty?

    host = destination_course.instance.host
    return course_assessment_url(destination_course, copies.first, host: host) if copies.one?

    tab = copies.first.tab
    course_assessments_url(destination_course, category: tab.category_id, tab: tab.id, host: host)
  end

  def record_adoption(listing, destination_course, copy, current_user)
    Course::Assessment::Marketplace::Adoption.create!(
      listing: listing,
      destination_course: destination_course,
      duplicated_assessment: copy,
      adopted_version_at: listing.current_version.published_at,
      creator: current_user,
      updater: current_user
    )
  end
end
