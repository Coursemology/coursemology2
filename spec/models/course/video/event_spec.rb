# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Event, type: :model do
  it { is_expected.to belong_to(:session).inverse_of(:events) }

  let!(:instance) { create(:instance, :with_video_component_enabled) }
  with_tenant(:instance) do
    describe 'validations' do
      context 'when video time is negative' do
        subject do
          build(:video_event,
                video_time_initial: -1)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
        end
      end
    end
  end
end
