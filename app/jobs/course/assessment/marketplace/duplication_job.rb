# frozen_string_literal: true
class Course::Assessment::Marketplace::DuplicationJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  queue_as :duplication

  protected

  def perform_tracked(listing_ids, destination_course, destination_tab_id, options = {})
    current_user = options[:current_user]
    ActsAsTenant.without_tenant do
      listings = Course::Assessment::Marketplace::Listing.published.where(id: listing_ids)
      target_tab = find_tab(destination_course, destination_tab_id)
      last_copy = nil
      listings.each do |listing|
        # The adoption row is written by the duplication service itself, which tracks every copy of a
        # listed assessment regardless of the path that produced it. See
        # `Course::Duplication::BaseService#record_marketplace_adoptions`.
        last_copy = duplicate_listing(listing, destination_course, current_user)
        reparent_into_tab(last_copy, target_tab)
      end
      redirect_to assessments_url(destination_course, target_tab || last_copy&.tab)
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
    source = listing.authoring_assessment
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

  # Points at the tab the copies actually landed in. No tab is requested from the sidebar entry
  # point, and a requested tab may not belong to the destination course -- in both cases the
  # duplication picks the destination's default tab, and the redirect has to follow it there
  # instead of naming a tab (and its category) that the user cannot open.
  def assessments_url(destination_course, tab)
    redirect_category_id = tab&.category_id || destination_course.assessment_categories.first.id
    course_assessments_url(destination_course,
                           category: redirect_category_id,
                           tab: tab&.id,
                           host: destination_course.instance.host)
  end
end
