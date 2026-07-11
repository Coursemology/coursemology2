# frozen_string_literal: true
class Course::Assessment::Marketplace::PreviewCopyService
  def self.copy!(listing:, container:, course_user:, current_user:)
    new(listing, container, course_user, current_user).copy!
  end

  def initialize(listing, container, course_user, current_user)
    @listing = listing
    @container = container
    @course_user = course_user
    @current_user = current_user
  end

  def copy!
    ActsAsTenant.without_tenant do
      source = @listing.assessment
      copy = Course::Duplication::ObjectDuplicationService.duplicate_objects(
        source.course, @container, source, current_user: @current_user
      )
      reparent_into_default_tab(copy)
      upsert_marker(copy)
      copy
    end
  end

  private

  def reparent_into_default_tab(copy)
    target_tab = @container.assessment_categories.first.tabs.first
    return if copy.tab_id == target_tab.id

    copy.tab = target_tab
    copy.folder.parent = target_tab.category.folder
    copy.save!
  end

  def upsert_marker(copy)
    marker = Course::Assessment::Marketplace::Preview.
             find_or_initialize_by(listing: @listing, course_user: @course_user)
    superseded_assessment_id = marker.assessment_id unless marker.assessment_id == copy.id
    marker.assessment = copy
    marker.save!

    destroy_superseded_copy(superseded_assessment_id)
  end

  # Destroy the previous copy's assessment so old copies don't accumulate per re-copy
  # (design note §5: preview submissions are disposable). Storage is cheap, so this is
  # best-effort, not load-bearing.
  #
  # Only after the marker points at the new copy, and only via a freshly-loaded
  # assessment: Course::Assessment `has_one :marketplace_preview, dependent: :destroy`,
  # so destroying an assessment still linked to this marker would cascade into the
  # marker itself.
  def destroy_superseded_copy(assessment_id)
    return if assessment_id.nil?

    Course::Assessment.find_by(id: assessment_id)&.destroy
  end
end
