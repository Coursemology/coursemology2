# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::PersonalTimesController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable) }
    let(:course_user) { create(:course_user, course: course) }

    describe '#index' do
      subject { get :index, params: { course_id: course, user_id: course_user } }

      context 'when a Normal User visits the page' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Student visits the page' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a Course Teaching Assistant visits the page' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Manager visits the page' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }
        it { expect(subject).to be_successful }
      end

      context 'when a Course Observer visits the page' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#create' do
      let(:assessment) { create(:assessment, course: course) }
      subject do
        post :create, params: {
          course_id: course.id,
          user_id: course_user.id,
          personal_time: {
            lesson_plan_item_id: assessment.lesson_plan_item.id,
            fixed: true,
            start_at: assessment.start_at,
            bonus_end_at: assessment.bonus_end_at,
            end_at: assessment.end_at
          }
        }
      end

      context 'when a Normal User creates a personal time' do
        before { assessment.personal_times.reload.delete_all }
        let(:user) { create(:user) }
        before { sign_in(user) }
        it 'is unsuccessful' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
          expect(assessment.personal_times.reload.count).to eq(0)
        end
      end

      context 'when a Course Student creates a personal time' do
        before { assessment.personal_times.reload.delete_all }
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it 'is unsuccessful' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
          expect(assessment.personal_times.reload.count).to eq(0)
        end
      end

      context 'when a Course Teaching Assistant creates a personal time' do
        before { assessment.personal_times.reload.delete_all }
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }
        it 'is successfully created' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.personal_times.create.success'))
          expect(assessment.personal_times.reload.count).to eq(1)
        end
      end

      context 'when a Course Manager creates a personal time' do
        before { assessment.personal_times.reload.delete_all }
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }
        it 'is successfully created' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.personal_times.create.success'))
          expect(assessment.personal_times.reload.count).to eq(1)
        end
      end

      context 'when a Course Observer creates a personal time' do
        before { assessment.personal_times.reload.delete_all }
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it 'is unsuccessful' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
          expect(assessment.personal_times.reload.count).to eq(0)
        end
      end
    end

    describe '#destroy' do
      let(:assessment) { create(:assessment, course: course) }
      let(:personal_time) do
        personal_time = assessment.reload.find_or_create_personal_time_for(course_user)
        personal_time.save!
        personal_time
      end
      subject do
        delete :destroy, params: {
          course_id: course.id,
          user_id: course_user.id,
          id: personal_time.id
        }
      end

      context 'when a Normal User destroys a personal time' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it 'is unsuccessful' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
          expect(assessment.personal_times.reload.count).to eq(1)
        end
      end

      context 'when a Course Student destroys a personal time' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it 'is unsuccessful' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
          expect(assessment.personal_times.reload.count).to eq(1)
        end
      end

      context 'when a Course Teaching Assistant destroys a personal time' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { sign_in(user) }
        it 'is successfully destroyed' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.personal_times.destroy.success'))
          expect(assessment.personal_times.reload.count).to eq(0)
        end
      end

      context 'when a Course Manager destroys a personal time' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }
        it 'is successfully destroyed' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.personal_times.destroy.success'))
          expect(assessment.personal_times.reload.count).to eq(0)
        end
      end

      context 'when a Course Observer destroys a personal time' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it 'is unsuccessful' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
          expect(assessment.personal_times.reload.count).to eq(1)
        end
      end
    end
  end
end
