# frozen_string_literal: true
class Course::Assessment::MarketplaceListingsController < Course::Assessment::Controller
  before_action :authorize_publish_to_marketplace!

  # A published version of an existing listing is not a source assessment. Refused server-side and
  # not only by withholding the button: the listing this would create has its source assessment
  # frozen inside the container, so it could never be edited nor cut a further version.
  SNAPSHOT_REJECTION = 'This is a published version of an existing listing, not a source assessment.'

  def create
    return render json: { errors: [SNAPSHOT_REJECTION] }, status: :unprocessable_content if
      @assessment.marketplace_snapshot?

    listing = Course::Assessment::Marketplace::PublishService.publish(@assessment, current_user)
    render json: { published: listing.published }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  # Cuts a new version from the authoring copy. Deliberately separate from `create`: re-listing an unlisted
  # assessment reactivates the row but must NOT silently republish changed content.
  def publish_version
    listing = @assessment.marketplace_listing
    return render json: { errors: ['Not listed on the marketplace.'] }, status: :unprocessable_content if listing.nil?

    version = Course::Assessment::Marketplace::PublishService.publish_new_version(listing, current_user)
    render json: { published_at: version.published_at }, status: :ok
  rescue ArgumentError => e
    render json: { errors: [e.message] }, status: :unprocessable_content
  end

  def destroy
    listing = @assessment.marketplace_listing
    if listing&.update(published: false)
      head :ok
    else
      head :unprocessable_content
    end
  end

  private

  # Publishing is admin-only. `authorize!(:publish_to_marketplace, @assessment)` alone is
  # insufficient: teaching staff hold `can :manage, Course::Assessment` over their own course's
  # assessments (assessment_ability.rb:189), and CanCan's `:manage` wildcard subsumes every
  # custom action — including `:publish_to_marketplace`. Gate explicitly on administrator status.
  def authorize_publish_to_marketplace!
    authorize!(:publish_to_marketplace, @assessment)
    raise CanCan::AccessDenied unless current_user&.administrator?
  end

  def component
    current_component_host[:course_assessments_component]
  end
end
