# frozen_string_literal: true
class Course::Assessment::Marketplace::QuestionsController < Course::Assessment::Marketplace::Controller
  before_action :authorize_access!

  def show
    ActsAsTenant.without_tenant do
      listing = Course::Assessment::Marketplace::Listing.published.
                includes(current_version: :assessment).find_by(id: params[:listing_id])
      raise CanCan::AccessDenied unless listing

      # The SNAPSHOT, never the authoring copy.
      @assessment = listing.current_version&.assessment
      raise CanCan::AccessDenied unless @assessment

      authorize!(:preview_in_marketplace, listing)

      @question = @assessment.questions.includes(:actable).find(params[:id])
      @question_assessment = @question.question_assessments.find_by!(assessment: @assessment)
      render 'show' # rendered inside without_tenant so actable associations resolve cross-instance
    end
  end

  private

  def authorize_access!
    authorize!(:access_marketplace, current_course)
  end
end
