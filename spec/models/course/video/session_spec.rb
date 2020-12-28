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

    describe 'events' do
      let(:session) { create(:video_session, :with_events_paused) }

      it 'returns events in order of sequence number' do
        expect(session.events.pluck(:sequence_num)).to eq((1..session.events.count).to_a)
      end
    end

    describe 'with_events_present' do
      let(:submission) { create(:video_submission) }
      let!(:session1) { create(:video_session, :with_events_paused, submission: submission) }
      let!(:session2) { create(:video_session, submission: submission) }

      subject do
        submission.sessions.with_events_present
      end

      it 'returns only sessions with events' do
        expect(subject.count).to eq(1)
        expect(subject.first).to eq(session1)
      end
    end

    describe 'merge_in_events!' do
      subject do
        create(:video_session, :with_events_paused)
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
          expect(subject.events.count).to eq(12)
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

        it 'creates a new event' do
          expect(subject.events.count).to eq(13)
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
