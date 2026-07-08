# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::AssessmentsController, type: :controller do
  render_views
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:admin) { create(:administrator) }

    describe 'GET #show — marketplace fields' do
      context 'as a system admin' do
        before { controller_sign_in(controller, admin) }

        it 'grants the publish permission and reports not-yet-published' do
          get :show, as: :json, params: { course_id: course, id: assessment }
          body = JSON.parse(response.body)
          expect(body['permissions']).to include('canPublishToMarketplace' => true)
          expect(body).to include('isPublishedToMarketplace' => false)
          expect(body['marketplaceListingUrl']).to be_present
        end

        it 'reports isPublishedToMarketplace true once a published listing exists' do
          create(:course_assessment_marketplace_listing, assessment: assessment, published: true)
          get :show, as: :json, params: { course_id: course, id: assessment }
          expect(JSON.parse(response.body)).to include('isPublishedToMarketplace' => true)
        end
      end

      context 'as a course manager (non-admin)' do
        let(:manager) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, manager) }

        it 'withholds the publish permission' do
          get :show, as: :json, params: { course_id: course, id: assessment }
          expect(JSON.parse(response.body)['permissions']).to include('canPublishToMarketplace' => false)
        end
      end
    end
  end
end
