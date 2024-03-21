# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Statistics::AggregateController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable) }
    let(:course_user) { create(:course_user, course: course) }

    describe '#all_staff' do
      subject { get :all_staff, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end
    end

    describe '#all_students' do
      subject { get :all_students, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end
    end

    describe '#course_progression' do
      subject { get :course_progression, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end
    end

    describe '#course_performance' do
      subject { get :course_performance, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end
    end

    describe '#all_assessments' do
      render_views
      let!(:assessment) { create(:assessment, :published, :with_all_question_types, course: course) }
      let!(:unpublished_assessment) { create(:assessment, :with_all_question_types, course: course) }
      subject { get :all_assessments, format: :json, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User pings the endpoint' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student pings the endpoint' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant pings the endpoint' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager pings the endpoint' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }

        it 'expects to render all published assessments' do
          expect(subject).to be_successful
          json_result = JSON.parse(response.body)
          expect(json_result['assessments'].count).to eq(1)
        end
      end

      context 'when a Course Observer pings the endpoint' do
        let(:user) { create(:course_observer, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end
    end
  end
end
