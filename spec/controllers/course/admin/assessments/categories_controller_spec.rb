# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::Assessments::CategoriesController, type: :controller do
  let(:instance) { Instance.default }
  let!(:setting_email) { Course::Settings::Email }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let!(:course) { create(:course, creator: user) }
    let!(:category_stub) do
      stub = create(:course_assessment_category, course: course)
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub).to receive(:save).and_return(false)
      stub
    end

    before { controller_sign_in(controller, user) }

    describe '#create' do
      subject { post :create, params: { course_id: course } }
      context 'upon create failure' do
        before do
          controller.instance_variable_set(:@category, category_stub)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#success' do
      subject { post :create, params: { course_id: course, category: { title: 'abcd', weight: 0 }, format: :json } }
      context 'upon create success' do
        it 'will add setting emails entity by 6' do
          cur_setting_emails_count = course.setting_emails.length
          subject
          expect(course.setting_emails.reload.length).to eq(cur_setting_emails_count + 6)
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: category_stub } }
      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@category, category_stub)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end
  end
end
