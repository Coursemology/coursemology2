# frozen_string_literal: true
class Course::Assessment::Marketplace::ListingsController < Course::Assessment::Marketplace::Controller
  before_action :authorize_access!

  def index
    ActsAsTenant.without_tenant do
      # Preload `lesson_plan_item` — `title` is not a column on Course::Assessment; it lives on
      # the acting-as record. The source course is deliberately NOT preloaded: the MVP exposes no
      # attribution, so nothing in the view reaches for it.
      @listings = Course::Assessment::Marketplace::Listing.published.
                  includes(assessment: :lesson_plan_item).to_a
      @adoption_counts = adoption_counts(@listings.map(&:id))
      @question_counts = question_counts(@listings.map(&:assessment_id))
      @destination_tabs = destination_tabs
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

  def show
    ActsAsTenant.without_tenant do
      @listing = Course::Assessment::Marketplace::Listing.published.includes(:assessment).find_by(id: params[:id])
      raise CanCan::AccessDenied unless @listing

      @assessment = @listing.assessment
      authorize!(:preview_in_marketplace, @assessment)
      render 'show'
    end
  end

  private

  def authorize_access!
    authorize!(:access_marketplace, current_course)
  end

  def adoption_counts(listing_ids)
    Course::Assessment::Marketplace::Adoption.
      where(listing_id: listing_ids).group(:listing_id).
      distinct.count(:destination_course_id)
  end

  def question_counts(assessment_ids)
    # reorder(nil) strips QuestionAssessment's `default_scope { order(weight: :asc) }`; without it
    # the injected `ORDER BY weight` breaks the grouped aggregate (PG::GroupingError — weight is
    # neither grouped nor aggregated).
    Course::QuestionAssessment.
      where(assessment_id: assessment_ids).reorder(nil).group(:assessment_id).
      distinct.count(:question_id)
  end

  def destination_tabs
    current_course.assessment_categories.includes(:tabs).flat_map do |category|
      category.tabs.map do |tab|
        { id: tab.id, title: tab.title, category_id: category.id, category_title: category.title }
      end
    end
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
