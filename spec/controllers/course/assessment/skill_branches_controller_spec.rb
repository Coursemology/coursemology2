# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SkillBranchesController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:immutable_skill_branch) do
      create(:course_assessment_skill_branch, course: course).tap do |immutable_skill_branch|
        allow(immutable_skill_branch).to receive(:save).and_return(false)
        allow(immutable_skill_branch).to receive(:destroy).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#create' do
      subject { post :create, params: { course_id: course } }

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@skill_branch, immutable_skill_branch)
          subject
        end

        it { is_expected.to render_template('new') }
      end
    end

    describe '#update' do
      subject do
        post :update, params: { course_id: course, id: immutable_skill_branch, skill_branch: { title: '' } }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@skill_branch, immutable_skill_branch)
          subject
        end

        it { is_expected.to render_template('edit') }
      end
    end

    describe '#destroy' do
      subject do
        delete :destroy, params: { course_id: course, id: immutable_skill_branch }
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@skill_branch, immutable_skill_branch)
          subject
        end

        it { is_expected.to redirect_to course_assessments_skills_path(course) }
        it 'sets the appropriate flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.assessment.skill_branches.destroy.failure'))
        end
      end
    end
  end
end
