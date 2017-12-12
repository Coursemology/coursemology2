# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::WatchInterval do
  it { is_expected.to belong_to(:submission).inverse_of(:watch_intervals) }

  let!(:instance) { create(:instance, :with_video_component_enabled) }
  with_tenant(:instance) do
    describe 'validations' do
      context 'when interval start is less than 0' do
        subject do
          build(:video_watch_interval,
                video_start: -1)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
        end
      end

      context 'when interval end is smaller than start' do
        subject do
          build(:video_watch_interval,
                video_start: 200,
                video_end: 100)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
        end
      end
    end
  end
end
