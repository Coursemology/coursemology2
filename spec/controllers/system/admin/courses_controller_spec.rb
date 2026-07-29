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

    # The hidden marketplace preview container is a `preview: true` course and the system-admin index
    # is cross-instance, so it appears here like any other course. Course pickers key off this flag to
    # leave it out of their options (never off a host or instance id), so the payload must carry it.
    describe '#index payload' do
      render_views

      let!(:container) do
        ActsAsTenant.without_tenant do
          Course::Assessment::Marketplace::PreviewContainerService.container_course
        end
      end
      let!(:ordinary_course) { create(:course) }

      before { controller_sign_in(controller, admin) }

      def row_for(course)
        response.parsed_body['courses'].find { |c| c['id'] == course.id }
      end

      it 'flags the preview container and only the preview container' do
        get :index, as: :json, params: { search: container.title }

        expect(row_for(container)['preview']).to be(true)

        get :index, as: :json, params: { search: ordinary_course.title }

        expect(row_for(ordinary_course)['preview']).to be(false)
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

        it 'destroys the course' do
          subject
          expect(controller.instance_variable_get(:@course)).to be_destroyed
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
