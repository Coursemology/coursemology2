# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::CoursesController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let(:normal_user) { create(:user) }

    describe '#index' do
      subject { get :index }

      context 'when a system administrator visits the page' do
        before { sign_in(admin) }

        it { is_expected.to render_template(:index) }
      end

      context 'when an instance administrator visits the page' do
        before { sign_in(instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a normal user visits the page' do
        before { sign_in(normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#destroy' do
      let!(:course_to_delete) { create(:course) }
      let!(:course_stub) do
        stub = create(:course)
        allow(stub).to receive(:destroy).and_return(false)
        stub
      end

      subject { delete :destroy, params: { id: course_to_delete } }

      context 'when the user is a system administrator' do
        before { sign_in(admin) }

        it 'destroys the course' do
          subject
          expect(controller.instance_variable_get(:@course)).to be_destroyed
        end

        it { is_expected.to redirect_to(admin_courses_path) }

        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('system.admin.courses.destroy.success'))
        end

        context 'when the course cannot be destroyed' do
          before do
            controller.instance_variable_set(:@course, course_stub)
            subject
          end

          it { is_expected.to redirect_to(admin_courses_path) }

          it 'sets an error flash message' do
            expect(flash[:danger]).to eq(I18n.t('system.admin.courses.destroy.failure'))
          end
        end
      end

      context 'when the user is an instance administrator' do
        before { sign_in(instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a normal user' do
        before { sign_in(normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
