# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::MilestonesController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:milestone_immutable_stub) do
      stub = create(:course_lesson_plan_milestone, course: course)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:update).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#create' do
      subject do
        post :create, format: :json, course_id: course,
                      lesson_plan_milestone: attributes_for(:course_lesson_plan_milestone)
      end

      context 'when saving succeeds' do
        it { is_expected.to render_template('_milestone') }
      end

      context 'when saving fails' do
        before do
          controller.instance_variable_set(:@milestone, milestone_immutable_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#update' do
      subject do
        patch :update, format: :json, course_id: course, id: milestone_immutable_stub,
                       lesson_plan_milestone: attributes_for(:course_lesson_plan_milestone)
      end

      context 'when update succeeds' do
        it { is_expected.to render_template('_milestone') }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@milestone, milestone_immutable_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: milestone_immutable_stub }

      context 'when destroy succeeds' do
        it { is_expected.to have_http_status(:ok) }
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@milestone, milestone_immutable_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end
  end
end
