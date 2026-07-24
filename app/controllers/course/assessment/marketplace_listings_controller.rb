# frozen_string_literal: true
class Course::Assessment::MarketplaceListingsController < Course::Assessment::Controller
  before_action :authorize_publish_to_marketplace!

  def create
    listing = Course::Assessment::Marketplace::PublishService.publish(@assessment, current_user)
    render json: { published: listing.published }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
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
