# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::AdminController do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { sign_in(user) }

    describe '#index' do
      subject { get :index, course_id: course }

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, :approved, course: course).user }

        it { is_expected.to render_template(:index) }
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, :approved, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, :approved, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update' do
      let(:title) { 'New Title' }
      subject { patch :update, course_id: course, course: { title: title } }

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, :approved, course: course).user }

        it { is_expected.to redirect_to(course_admin_path(course)) }

        it 'changes the title' do
          subject

          expect(course.reload.title).to eq(title)
        end
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, :approved, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, :approved, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
