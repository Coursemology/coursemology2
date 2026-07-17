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
      listings.each do |listing|
        copy = duplicate_listing(listing, destination_course, current_user)
        reparent_into_tab(copy, destination_course, destination_tab_id)
        record_adoption(listing, destination_course, copy, current_user)
      end
      redirect_to course_assessments_url(destination_course,
                                         category: destination_course.assessment_categories.first.id,
                                         tab: destination_tab_id,
                                         host: destination_course.instance.host)
    end
  end

  private

  def duplicate_listing(listing, destination_course, current_user)
    source = listing.assessment
    Course::Duplication::ObjectDuplicationService.duplicate_objects(
      source.course, destination_course, source, current_user: current_user
    )
  end

  def reparent_into_tab(copy, destination_course, destination_tab_id)
    target_tab = destination_course.assessment_categories.
                 flat_map(&:tabs).find { |tab| tab.id == destination_tab_id }
    return unless target_tab && copy.tab_id != target_tab.id

    copy.tab = target_tab
    copy.folder.parent = target_tab.category.folder
    copy.save!
  end

  def record_adoption(listing, destination_course, copy, current_user)
    Course::Assessment::Marketplace::Adoption.create!(
      listing: listing,
      destination_course: destination_course,
      duplicated_assessment: copy,
      creator: current_user,
      updater: current_user
    )
  end
end
