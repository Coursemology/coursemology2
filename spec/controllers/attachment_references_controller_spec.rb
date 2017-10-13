# frozen_string_literal: true
require 'rails_helper'

RSpec.describe AttachmentReferencesController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    before { sign_in(user) }

    describe '#show' do
      let(:attachment_reference) { create(:attachment_reference) }
      subject { get :show, params: { id: attachment_reference } }

      it { is_expected.to redirect_to(attachment_reference.attachment.url) }
    end
  end
end
