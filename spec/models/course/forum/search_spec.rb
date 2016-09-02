# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::Search, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Course::Forum::Search.new(search_hash) }

    describe '#parse_time' do
      context 'when an invalid time string is given' do
        let(:search_hash) do
          { start_time: 'not a time string' }
        end

        it 'generates errors for the time attribute' do
          expect(subject.errors.size).to eq(1)
        end
      end
    end
  end
end
