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

  def duplicate
    listings = authorized_listings
    job = Course::Assessment::Marketplace::DuplicationJob.perform_later(
      listings.map(&:id), current_course, duplicate_params[:destination_tab_id].to_i,
      current_user: current_user
    ).job
    render partial: 'jobs/submitted', locals: { job: job }
  end

  private

  def authorize_access!
    authorize!(:access_marketplace, current_course)
  end

  def authorized_listings
    listings = ActsAsTenant.without_tenant do
      Course::Assessment::Marketplace::Listing.published.where(id: duplicate_params[:listing_ids]).includes(:assessment)
    end
    raise CanCan::AccessDenied if listings.empty?

    listings.each { |listing| authorize!(:duplicate_from_marketplace, listing.assessment) }
    authorize!(:duplicate_to, current_course)
    listings
  end

  def duplicate_params
    params.permit(:destination_tab_id, listing_ids: [])
  end
end
