# frozen_string_literal: true
class Course::Assessment::Marketplace::ListingsController < Course::Assessment::Marketplace::Controller
  before_action :authorize_access!

  def index
    ActsAsTenant.without_tenant do
      @listings = Course::Assessment::Marketplace::Listing.published.includes(:assessment).to_a
      listing_ids = @listings.map(&:id)
      assessment_ids = @listings.map(&:assessment_id)
      @adoption_counts = Course::Assessment::Marketplace::Adoption.
                         where(listing_id: listing_ids).group(:listing_id).
                         distinct.count(:destination_course_id)
      # reorder(nil) strips QuestionAssessment's `default_scope { order(weight: :asc) }`; without it
      # the injected `ORDER BY weight` breaks the grouped aggregate (PG::GroupingError — weight is
      # neither grouped nor aggregated).
      @question_counts = Course::QuestionAssessment.
                         where(assessment_id: assessment_ids).reorder(nil).group(:assessment_id).
                         distinct.count(:question_id)
    end
  end

  private

  def authorize_access!
    authorize!(:access_marketplace, current_course)
  end
end
