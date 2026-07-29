# frozen_string_literal: true
# Adopter-side actions on a duplicated marketplace assessment.
class Course::Assessment::MarketplaceAdoptionsController < Course::Assessment::Controller
  before_action :authorize_manage_assessment!

  def apply_latest_version
    adoption = Course::Assessment::Marketplace::Adoption.find_by(duplicated_assessment_id: @assessment.id)
    return head :not_found if adoption.nil?

    if @assessment.submission_counts_by_author[:student] > 0
      return render json: { errors: [t('.student_submissions_exist')] },
                    status: :unprocessable_content
    end

    job = Course::Assessment::Marketplace::ApplyVersionJob.
          perform_later(@assessment, current_user: current_user).job
    render partial: 'jobs/submitted', locals: { job: job }, status: :ok
  end

  private

  # The adoption is resolved from `@assessment`, never from a params id — there is therefore no id
  # to tamper with and no way to reach another course's adoption. This endpoint reads no params at
  # all: which version it applies is the listing's business, not the client's.
  def authorize_manage_assessment!
    authorize!(:manage, @assessment)
  end

  def component
    current_component_host[:course_assessments_component]
  end
end
