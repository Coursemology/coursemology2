# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Statistics::StatisticsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable) }
    let(:course_user) { create(:course_user, course: course) }

    describe '#index' do
      subject { get :index, as: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User visits the page' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student visits the page' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant visits the page' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager visits the page' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer visits the page' do
        let(:user) { create(:course_observer, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect(subject).to be_successful }
      end
    end
  end
end
