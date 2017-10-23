# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::AdminController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { sign_in(user) }

    describe '#index' do
      subject { get :index, params: { course_id: course } }

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it { is_expected.to render_template(:index) }
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update' do
      let(:title) { 'New Title' }
      subject { patch :update, params: { course_id: course, course: { title: title } } }

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it { is_expected.to redirect_to(course_admin_path(course)) }

        it 'changes the title' do
          subject

          expect(course.reload.title).to eq(title)
        end
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course } }
      before { controller.instance_variable_set(:@course, course) }

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'destroys the course' do
          subject
          expect(controller.current_course).to be_destroyed
        end

        it { is_expected.to redirect_to(courses_path) }

        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.admin.admin.destroy.success'))
        end

        context 'when the course cannot be destroyed' do
          before do
            allow(course).to receive(:destroy).and_return(false)
            subject
          end

          it { is_expected.to redirect_to(course_admin_path(course)) }

          it 'sets an error flash message' do
            expect(flash[:danger]).to eq(I18n.t('course.admin.admin.destroy.failure'))
          end
        end
      end

      context 'when the user is an Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
