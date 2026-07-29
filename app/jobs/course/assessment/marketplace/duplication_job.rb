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
      target_tab = find_tab(destination_course, destination_tab_id)
      copies = listings.map do |listing|
        copy = duplicate_listing(listing, destination_course, current_user)
        reparent_into_tab(copy, target_tab)
        resolve_title_collision(copy, listing, destination_course)
        record_adoption(listing, destination_course, copy, current_user)
        copy
      end
      landing_url = landing_url_for(copies, destination_course)
      redirect_to landing_url if landing_url
    end
  end

  private

  # @return [Course::Assessment::Tab, nil] The requested tab, or nil when no tab was requested or
  #   the requested one does not belong to the destination course.
  def find_tab(destination_course, destination_tab_id)
    return nil unless destination_tab_id

    destination_course.assessment_categories.
      flat_map(&:tabs).find { |tab| tab.id == destination_tab_id }
  end

  def duplicate_listing(listing, destination_course, current_user)
    source = listing.current_version.assessment
    Course::Duplication::ObjectDuplicationService.duplicate_objects(
      source.course, destination_course, source, current_user: current_user
    )
  end

  def reparent_into_tab(copy, target_tab)
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

  # Truncate the base for an over-long title.
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

  # Written here rather than left to `Course::Duplication::BaseService#record_marketplace_adoptions`:
  # that sweep keys off the SOURCE's own `marketplace_listing`, and the source here is the container
  # snapshot, which authors no listing. This path is the only one that knows which listing it served.
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
