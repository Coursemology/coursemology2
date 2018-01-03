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

    describe 'merge_in_events!' do
      subject do
        create(:video_session, :with_events)
      end

      context 'when event already exists' do
        let!(:time) { Time.zone.now }
        before do
          subject.merge_in_events!([{ sequence_num: 1,
                                      video_time: 2345,
                                      event_type: 'seek_start',
                                      event_time: time.midnight }])
        end

        it 'overwrites the old event ' do
          expect(subject.events.count).to eq(5)
          expect(subject.events.where(sequence_num: 1).count).to eq(1)

          old_event = subject.events.find_by(sequence_num: 1)
          expect(old_event.video_time).to eq(2345)
          expect(old_event.event_type).to eq('seek_start')
          expect(old_event.event_time).to eq(time.midnight)
        end
      end

      context 'when event is new' do
        let!(:time) { Time.zone.now }
        before do
          subject.merge_in_events!([{ sequence_num: 100,
                                      video_time: 2345,
                                      event_type: 'seek_end',
                                      event_time: time.midnight }])
        end

        it `creates a new event` do
          expect(subject.events.count).to eq(6)
          expect(subject.events.exists?(sequence_num: 100)).to be_truthy

          new_event = subject.events.find_by(sequence_num: 100)
          expect(new_event.video_time).to eq(2345)
          expect(new_event.event_type).to eq('seek_end')
          expect(new_event.event_time).to eq(time.midnight)
        end
      end
    end
  end
end
