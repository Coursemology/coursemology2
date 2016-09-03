# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePoints::ForumDisbursement, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:forum_disbursement) { Course::ExperiencePoints::ForumDisbursement.new(params) }

    describe '#start_time' do
      context 'when end time is assigned but start time is not' do
        let(:end_time) { 1.day.ago }
        let(:params) { { end_time: end_time.to_s } }

        it 'returns a time one week before the end time' do
          expect(forum_disbursement.start_time.to_i).to eq((end_time - 1.week).to_i)
        end
      end
    end

    describe '#end_time' do
      context 'when start time is assigned but end time is not' do
        let(:start_time) { 2.weeks.ago }
        let(:params) { { start_time: start_time.to_s } }

        it 'returns a time one week after the start time' do
          expect(forum_disbursement.end_time.to_i).to eq((start_time + 1.week).to_i)
        end
      end
    end
  end
end
