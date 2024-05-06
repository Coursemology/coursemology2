# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::AdminController do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    before { controller_sign_in(controller, user) }

    describe '#index' do
      before { get :index, as: :json }
      it { is_expected.to render_template('index') }
    end
  end
end
