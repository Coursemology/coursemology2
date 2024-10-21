# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::CoursesController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let(:normal_user) { create(:user) }

    describe '#index' do
      subject { get :index, as: :json }

      context 'when a system administrator visits the page' do
        before { controller_sign_in(controller, admin) }

        it { is_expected.to render_template(:index) }
      end

      context 'when an instance administrator visits the page' do
        before { controller_sign_in(controller, instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a normal user visits the page' do
        before { controller_sign_in(controller, normal_user) }

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
        before { controller_sign_in(controller, admin) }

        it 'soft deletes the course' do
          subject
          expect(controller.instance_variable_get(:@course).deleted_at).to_not be_nil
        end

        it 'succeeds with http status ok' do
          expect(subject).to have_http_status(:ok)
        end

        context 'when the course cannot be destroyed' do
          before do
            controller.instance_variable_set(:@course, course_stub)
            subject
          end

          it 'fails with http status bad request' do
            expect(subject).to have_http_status(:bad_request)
          end
        end
      end

      context 'when the user is an instance administrator' do
        before { controller_sign_in(controller, instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a normal user' do
        before { controller_sign_in(controller, normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
