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

    describe '#save' do
      subject { post :create, course_id: course, lesson_plan_milestone: milestone_immutable_stub }

      context 'when saving fails' do
        before do
          controller.instance_variable_set(:@milestone, milestone_immutable_stub)
          subject
        end

        it { is_expected.to render_template('new') }
      end
    end

    describe '#update' do
      subject do
        patch :update, course_id: course,
                       id: milestone_immutable_stub,
                       lesson_plan_milestone: { id: milestone_immutable_stub.id }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@milestone, milestone_immutable_stub)
          subject
        end

        it { is_expected.to render_template('edit') }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: milestone_immutable_stub }

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@milestone, milestone_immutable_stub)
          subject
        end

        it { is_expected.to redirect_to(course_lesson_plan_path(course)) }
      end
    end
  end
end
