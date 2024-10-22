# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::Instance::CoursesController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:instance_admin) { create(:instance_administrator).user }
    let(:normal_user) { create(:user) }

    describe '#index' do
      subject { get :index, as: :json }

      context 'when an administrator visits the page' do
        before { controller_sign_in(controller, instance_admin) }

        it 'renders the template' do
          expect(subject).to render_template(:index)
        end
      end

      context 'when a normal user visits the page' do
        before { controller_sign_in(controller, normal_user) }

        it 'raises an error' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
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

      context 'when the user is an administrator' do
        before { controller_sign_in(controller, instance_admin) }

        it 'destroys the course' do
          subject
          expect(controller.instance_variable_get(:@course)).to be_destroyed
        end

        it { is_expected.to have_http_status(:ok) }

        context 'when the course cannot be destroyed' do
          before do
            controller.instance_variable_set(:@course, course_stub)
            subject
          end

          it { is_expected.to have_http_status(:bad_request) }
        end
      end

      context 'when the user is a normal user' do
        before { controller_sign_in(controller, normal_user) }

        it 'raises an error' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end
  end
end
