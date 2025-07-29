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

    describe '#deployment_info' do
      subject { get :deployment_info, as: :json }

      context 'when GIT_COMMIT environment variable is set' do
        before do
          @original_git_commit = ENV.fetch('GIT_COMMIT', nil)
          ENV['GIT_COMMIT'] = 'abc123def456'
        end

        after do
          ENV['GIT_COMMIT'] = @original_git_commit
        end

        it 'returns the commit hash' do
          subject
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to eq({ 'commit_hash' => 'abc123def456' })
        end
      end

      context 'when GIT_COMMIT environment variable is not set' do
        before do
          @original_git_commit = ENV.fetch('GIT_COMMIT', nil)
          ENV.delete('GIT_COMMIT')
        end

        after do
          ENV['GIT_COMMIT'] = @original_git_commit
        end

        it 'returns nil for commit hash' do
          subject
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to eq({ 'commit_hash' => nil })
        end
      end

      context 'when user is not an administrator' do
        let(:user) { create(:user) }

        it 'raises CanCan::AccessDenied exception' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end
  end
end
