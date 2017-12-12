# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Session do
  it { is_expected.to belong_to(:submission).inverse_of(:sessions) }

  let!(:instance) { create(:instance, :with_video_component_enabled) }
  with_tenant(:instance) do
    describe 'validations' do
      context 'when session start is after session end' do
        subject do
          build(:video_session,
                session_start: Time.zone.now,
                session_end: Time.zone.now - 5.minutes)
        end

        it { is_expected.not_to be_valid }
      end

      context 'when session start is the same as session end' do
        subject do
          time = Time.zone.now
          build(:video_session,
                session_start: time,
                session_end: time)
        end

        it { is_expected.to be_valid }
      end
    end
  end
end
