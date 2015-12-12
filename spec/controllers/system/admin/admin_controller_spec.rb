require 'rails_helper'

RSpec.describe System::Admin::AdminController do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    before { sign_in(user) }

    describe '#index' do
      before { get :index }
      it { is_expected.to render_template('index') }
    end
  end
end
