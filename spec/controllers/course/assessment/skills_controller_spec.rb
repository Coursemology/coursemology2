# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SkillsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:immutable_skill) do
      create(:course_assessment_skill, course: course).tap do |immutable_skill|
        allow(immutable_skill).to receive(:save).and_return(false)
        allow(immutable_skill).to receive(:destroy).and_return(false)
      end
    end

    before { controller_sign_in(controller, user) }

    describe '#create' do
      subject { post :create, params: { course_id: course } }

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@skill, immutable_skill)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#update' do
      subject do
        post :update, params: { course_id: course, id: immutable_skill, skill: { title: '' } }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@skill, immutable_skill)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#destroy' do
      subject do
        delete :destroy, params: { course_id: course, id: immutable_skill }
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@skill, immutable_skill)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end
  end
end
