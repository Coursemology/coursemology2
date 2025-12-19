# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::Instance::UserInvitationsController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:instance_admin) { create(:instance_administrator).user }
    let(:normal_user) { create(:user) }

    describe '#index' do
      subject { get :index, as: :json }

      context 'when a system administrator visits the page' do
        before { controller_sign_in(controller, instance_admin) }

        it { is_expected.to render_template(:index) }
      end

      context 'when a normal user visits the page' do
        before { controller_sign_in(controller, normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#create' do
      before { controller_sign_in(controller, normal_user) }
      let(:invite_params) do
        invitation = { name: generate(:name), email: generate(:email) }
        invitations = { generate(:nested_attribute_new_id) => invitation }
        { invitations_attributes: invitations }
      end

      subject { post :create, format: :json, params: { instance: invite_params } }

      context 'when an instance administrator visits the page' do
        before { controller_sign_in(controller, instance_admin) }
        it { is_expected.to have_http_status(:ok) }

        context 'when the invitations do not get created successfully' do
          before do
            stubbed_invitation_service = Instance::UserInvitationService.new(instance)
            stubbed_invitation_service.define_singleton_method(:invite) do |*|
              false
            end
            expect(controller).to receive(:invitation_service).
              and_return(stubbed_invitation_service)
          end

          it { is_expected.to have_http_status(:bad_request) }
        end
      end

      context 'when a normal user visits the page' do
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#resend_invitation' do
      before do
        controller_sign_in(controller, instance_admin)
      end
      let!(:invitation) { create(:instance_user_invitation, instance: instance) }
      subject { post :resend_invitations, format: :json, params: { user_invitation_id: invitation.id } }

      it 'loads the invitation' do
        subject
        expect(controller.instance_variable_get(:@invitations)).to contain_exactly(invitation)
      end

      context 'if the provided invitation has already been confirmed' do
        before { invitation.confirm!(confirmer: instance_admin) }
        it 'will not load the invitation' do
          subject
          expect(controller.instance_variable_get(:@invitations)).to be_empty
        end
      end
    end

    describe '#resend_invitations' do
      before do
        controller_sign_in(controller, instance_admin)
      end
      let!(:pending_invitations) { create_list(:instance_user_invitation, 3, instance: instance) }
      subject { post :resend_invitations, format: :json, params: {} }

      it 'loads the all unconfirmed invitations' do
        subject
        expect(controller.instance_variable_get(:@invitations)).
          to contain_exactly(*pending_invitations)
      end
    end
  end
end
