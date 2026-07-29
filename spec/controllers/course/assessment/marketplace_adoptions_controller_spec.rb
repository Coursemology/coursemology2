# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::MarketplaceAdoptionsController, type: :controller do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:destination_course) { create(:course) }
    let(:copy) { create(:assessment, :with_mcq_question, course: destination_course) }
    let(:v1_at) { 30.days.ago.change(usec: 0) }
    let(:listing) do
      create(:course_assessment_marketplace_listing, published: true, first_published_at: v1_at)
    end
    let!(:v1) do
      version = create(:course_assessment_marketplace_listing_version,
                       listing: listing,
                       assessment: create(:assessment, course: listing.authoring_assessment.course),
                       published_at: v1_at, published_by: listing.publisher)
      listing.update!(current_version: version)
      version
    end
    let!(:adoption) do
      create(:course_assessment_marketplace_adoption,
             listing: listing, destination_course: destination_course,
             duplicated_assessment: copy, adopted_version_at: v1_at)
    end
    let(:manager) { create(:course_manager, course: destination_course).user }

    describe 'POST #apply_latest_version' do
      render_views

      with_active_job_queue_adapter(:test) do
        def apply
          post :apply_latest_version, as: :json,
                                      params: { course_id: destination_course.id, assessment_id: copy.id }
        end

        context 'as a course manager' do
          before { controller_sign_in(controller, manager) }

          it 'enqueues the update and answers with the job url' do
            expect { apply }.to have_enqueued_job(Course::Assessment::Marketplace::ApplyVersionJob)

            expect(response).to have_http_status(:ok)
            expect(response.parsed_body['jobUrl']).to be_present
          end

          # The client flag is advisory. A stale page must never be able to destroy student work.
          it 'refuses when a real student has attempted the copy, whatever the client believed' do
            create(:submission, :attempting, assessment: copy,
                                             creator: create(:course_student, course: destination_course).user)

            expect { apply }.not_to have_enqueued_job(Course::Assessment::Marketplace::ApplyVersionJob)
            expect(response).to have_http_status(:unprocessable_content)
            key = 'course.assessment.marketplace_adoptions.apply_latest_version.student_submissions_exist'
            expect(I18n.t(key)).to eq(key)
            expect(response.parsed_body['errors'].first).to eq(I18n.t(key))
          end

          it 'still allows the update when only staff have test submissions' do
            create(:submission, :attempting, assessment: copy, creator: manager)

            expect { apply }.to have_enqueued_job(Course::Assessment::Marketplace::ApplyVersionJob)
          end

          it 'responds 404 when the assessment was never adopted' do
            other = create(:assessment, course: destination_course)

            post :apply_latest_version, as: :json,
                                        params: { course_id: destination_course.id, assessment_id: other.id }

            expect(response).to have_http_status(:not_found)
          end
        end

        context 'as a course student' do
          before { controller_sign_in(controller, create(:course_student, course: destination_course).user) }

          it 'is denied' do
            expect { apply }.to raise_exception(CanCan::AccessDenied)
          end
        end
      end
    end
  end
end
