# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LeaderboardsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }

    before { sign_in(user) }

    describe '#show' do
      subject { get :show, params: { course_id: course } }

      context 'when the leaderboard component is disabled' do
        before do
          allow(controller).to receive_message_chain('current_component_host.[]').and_return(nil)
        end
        it 'raises an component not found error' do
          expect { subject }.to raise_error(ComponentNotFoundError)
        end
      end
    end

    describe '#groups' do
      subject { get :groups, params: { course_id: course } }

      context' when the group leaderboard is disabled' do
        it 'raises a standard error' do
          expect { subject }.to raise_error(ComponentNotFoundError)
        end
      end
    end
  end
end
