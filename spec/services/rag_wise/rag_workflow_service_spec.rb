# frozen_string_literal: true
require 'rails_helper'

RSpec.describe RagWise::RagWorkflowService, type: :service do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:topic) { create(:forum_topic, course: course, title: %(Bob's <b>"first"</b> topic)) }
    let(:forum_post) do
      create(:course_discussion_post, topic: topic.acting_as, text: %(<p>It's "quoted" &amp; 1 &lt; 2</p>))
    end
    let(:evaluation) { instance_double(RagWise::ResponseEvaluationService, 'question=': nil, 'answer=': nil) }
    let(:assistant) do
      instance_double(Langchain::Assistant, add_message: nil, add_message_and_run!: nil,
                                            messages: [double(content: 'An answer')])
    end

    before { allow(Langchain::Assistant).to receive(:new).and_return(assistant) }

    describe '#get_assistant_response' do
      it 'sends the topic title and post text to the LLM as plain text' do
        described_class.new(course, evaluation, 'a teaching assistant').get_assistant_response(forum_post, topic)

        expect(assistant).to have_received(:add_message_and_run!).
          with(content: %(query title: Bob's "first" topic query text: It's "quoted" & 1 < 2 ))
      end
    end
  end
end
