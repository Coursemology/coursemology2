# frozen_string_literal: true
require 'rails_helper'

RSpec.describe RagWise::DiscussionExtractionService, type: :service do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:topic) { create(:forum_topic, course: course, title: %(Bob's <b>"first"</b> topic)) }
    let!(:forum_post) do
      create(:course_discussion_post, topic: topic.acting_as, text: %(<p>It's "quoted" &amp; 1 &lt; 2</p>))
    end

    describe '#call' do
      let(:result) { described_class.new(course, topic, topic.latest_history).call }

      it 'returns the topic title and post text as plain text' do
        expect(result[:topic_title]).to eq(%(Bob's "first" topic))
        expect(result[:discussion].pluck(:text)).to include(%(It's "quoted" & 1 < 2))
      end
    end
  end
end
