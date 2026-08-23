# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::Discussion::TopicSettingsController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    before { controller_sign_in(controller, user) }

    describe '#edit' do
      subject { get :edit, params: { course_id: course, format: :json } }
      it { is_expected.to render_template(:edit) }
    end

    describe '#update' do
      before do
        allow(course).to receive(:save).and_return(false)
        allow(controller).to receive(:current_course).and_return(course)
      end

      context 'when course cannot be saved' do
        subject { patch :update, params: { course_id: course, settings_topics_component: { title: '' } } }
        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#update persisting is_showing_ai_generated_comments' do
      subject do
        patch :update, format: :json, params: {
          course_id: course, settings_topics_component: { is_showing_ai_generated_comments: false }
        }
      end

      it 'stores the flag on the topics component settings' do
        expect(subject).to render_template(:edit)
        expect(
          course.reload.settings(Course::Discussion::TopicsComponent.key).is_showing_ai_generated_comments
        ).to be(false)
      end
    end
  end
end
