# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::VideoSubmissionsController do
  let!(:instance) { create(:instance, :with_video_component_enabled) }
  with_tenant(:instance) do
    let!(:course) { create(:course, :with_video_component_enabled) }
    let!(:course_user) { create(:course_user, course: course) }

    describe '#index' do
      subject { get :index, params: { course_id: course, user_id: course_user } }
      before { sign_in(user) }

      context 'when a Normal User visits the page' do
        let!(:user) { create(:user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student visits the page' do
        let!(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant visits the page' do
        let!(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager visits the page' do
        let!(:user) { create(:course_manager, course: course).user }

        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer visits the page' do
        let!(:user) { create(:course_observer, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
