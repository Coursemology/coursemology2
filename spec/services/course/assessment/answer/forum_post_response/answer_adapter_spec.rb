# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ForumPostResponse::AnswerAdapter do
  let(:rubric) { instance_double(Course::Rubric) }

  def post_pack(post_text:, parent_text: nil)
    instance_double(Course::Assessment::Answer::ForumPost, post_text: post_text, parent_text: parent_text)
  end

  describe '#answer_text' do
    subject(:answer_text) { described_class.new(answer, rubric).answer_text }

    context 'with a free-text response and multiple selected posts' do
      let(:answer) do
        instance_double(
          Course::Assessment::Answer::ForumPostResponse,
          answer_text: '<p>My reflection</p>',
          post_packs: [post_pack(post_text: 'First body', parent_text: 'Parent body'),
                       post_pack(post_text: 'Second body')]
        )
      end

      it 'includes the response and each post, prefixing replies with their parent' do
        expect(answer_text).to include('My reflection')
        expect(answer_text).to include('Selected post 1')
        expect(answer_text).to include('In reply to: Parent body')
        expect(answer_text).to include('First body')
        expect(answer_text).to include('Selected post 2')
        expect(answer_text).to include('Second body')
        # The second post has no parent, so only the first reply is prefixed.
        expect(answer_text.scan('In reply to:').length).to eq(1)
      end
    end

    context 'without a free-text response' do
      let(:answer) do
        instance_double(Course::Assessment::Answer::ForumPostResponse,
                        answer_text: '', post_packs: [post_pack(post_text: 'Only post')])
      end

      it 'omits the empty response and just includes the selected post' do
        expect(answer_text).to eq("Selected post 1:\nOnly post")
      end
    end
  end
end
