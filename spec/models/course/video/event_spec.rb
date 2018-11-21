# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Event, type: :model do
  it { is_expected.to belong_to(:session).inverse_of(:events) }

  let!(:instance) { create(:instance, :with_video_component_enabled) }
  with_tenant(:instance) do
    describe 'validations' do
      context 'when video time is negative' do
        subject do
          build(:video_event, video_time: -1)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
        end
      end
    end

    describe '.interval_starts' do
      let(:session1) { create(:video_session, :with_events_paused) }
      let(:session2) { create(:video_session, :with_events_continuous) }

      it 'returns only the starts of watch intervals' do
        seq_nums = Course::Video::Event.
                   unscope(:order).
                   where(session_id: [session1.id, session2.id]).
                   interval_starts.
                   order(:video_time).
                   pluck(:video_time)
        expect(seq_nums).to eq([0, 0, 10, 19, 30, 39])
      end
    end

    describe '.interval_ends' do
      let(:session1) { create(:video_session, :with_events_paused) }
      let(:session2) { create(:video_session, :with_events_continuous) }

      it 'returns only the end of watch intervals' do
        seq_nums = Course::Video::Event.
                   unscope(:order).
                   where(session_id: [session1.id, session2.id]).
                   interval_ends.
                   order(:video_time).
                   pluck(:video_time)
        expect(seq_nums).to eq([5, 20, 25, 50, 70]) # 37 not included since it's captured in session
      end
    end

    describe '.unclosed_starts' do
      let(:session1) { create(:video_session, :with_events_paused) }
      let(:session2) { create(:video_session, :with_events_continuous) }

      it 'returns only start events without a matching end event' do
        seq_nums = Course::Video::Event.
                   unscope(:order).
                   where(session_id: [session1.id, session2.id]).
                   unclosed_starts.
                   order(:video_time).
                   pluck(:video_time)
        expect(seq_nums).to eq([19])
      end
    end

    describe '.all_start_and_end_events' do
      let(:session1) { create(:video_session, :with_events_paused) }
      let(:session2) { create(:video_session, :with_events_continuous) }

      it 'returns all the start and end events sorted by session and sequennce number' do
        sorted_events = Course::Video::Event.
                        where(session_id: [session1.id, session2.id]).
                        all_start_and_end_events
        session_id = sorted_events.map(&:session_id)
        seq_nums = sorted_events.pluck(:sequence_num)
        video_times = sorted_events.pluck(:video_time)
        expect(session_id).to eq(Array.new(10, session1.id) + Array.new(8, session2.id))
        expect(seq_nums).to eq([1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 1, 2, 4, 5, 6, 8, 9, 11])
        expect(video_times).to eq([0, 20, 20, 39, 39, 70, 70, 10, 10, 25, 0, 5, 30, 30, 50, 19, 20, 24])
      end
    end
  end
end
