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
      load_published_listing!
      @assessment = @listing.assessment
      authorize!(:preview_in_marketplace, @assessment)
      @preview_grading_inert =
        Course::Assessment::Marketplace::PreviewGradingPolicy.any_paid_grader?(@assessment)
      render 'show'
    end
  end

  def attempt
    # The listing (and its assessment) may live in another instance, so it is loaded and
    # authorized without the tenant scope. Everything after provisions in the *previewer's*
    # instance, which `current_tenant` only reports outside that block.
    ActsAsTenant.without_tenant do
      load_published_listing!
      authorize!(:preview_in_marketplace, @listing.assessment)
    end

    container = Course::Assessment::Marketplace::ContainerCourseService.
                find_or_create!(instance: current_tenant, creator: current_user)
    course_user = Course::Assessment::Marketplace::PreviewEnrolmentService.
                  ensure_manager!(course: container, user: current_user)

    copy = resume_or_fresh_copy(container, course_user)

    # Hand off to the platform's own attempt action, which creates or resumes the submission
    # (session token, monitoring, logging) and renders the { redirectUrl: } the SPA expects. None of
    # that is reimplemented here.
    #
    # The hop is deliberately server-side. The SPA's API client derives its course id from
    # window.location (BaseCourseAPI#courseId -> getCourseIdFromUrl), which still points at the
    # previewer's course mid-redirect — so a browser-made second hop would ask the wrong course for
    # the container's assessment. XHR follows this 302 transparently.
    redirect_to course_assessment_attempt_path(container, copy, format: :json)
  end

  private

  # Callers must wrap this in `ActsAsTenant.without_tenant` — a listing may be published in
  # another instance. An unpublished or unknown listing is denied rather than 404'd, so the
  # marketplace never confirms that a hidden listing exists.
  def load_published_listing!
    @listing = Course::Assessment::Marketplace::Listing.published.includes(:assessment).find_by(id: params[:id])
    raise CanCan::AccessDenied unless @listing

    @listing
  end

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

  # Resume the previewer's in-progress copy of this listing if they still have an unsubmitted
  # attempt against it; otherwise hand them a fresh copy (design note §5).
  def resume_or_fresh_copy(container, course_user)
    marker = Course::Assessment::Marketplace::Preview.for(@listing, course_user)
    return marker.assessment if resumable?(marker)

    Course::Assessment::Marketplace::PreviewCopyService.copy!(
      listing: @listing, container: container, course_user: course_user, current_user: current_user
    )
  end

  def resumable?(marker)
    return false unless marker&.assessment

    marker.assessment.submissions.find_by(creator: current_user)&.attempting? || false
  end
end
