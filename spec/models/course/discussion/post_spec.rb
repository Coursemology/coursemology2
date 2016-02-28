# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Post, type: :model do
  it { is_expected.to belong_to(:topic).inverse_of(:posts) }
  it { is_expected.to belong_to(:creator) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.all' do
      let(:topic) { create(:course_discussion_topic) }
      let(:posts) do
        (1..3).map do |i|
          create(:course_discussion_post, topic: topic, created_at: Time.zone.now + i.seconds)
        end
      end

      it 'is sorted by ascending date' do
        created_times = posts.map(&:created_at)
        expect(created_times.each_cons(2).all? { |current, following| current <= following })
      end
    end

    describe '.tsort' do
      let(:topic) { create(:course_discussion_topic) }
      let(:graph) do
        # root -> a -> b
        #      \-> c
        root = create(:course_discussion_post, topic: topic)
        a = create(:course_discussion_post, parent: root, topic: topic)
        b = create(:course_discussion_post, parent: a, topic: topic)
        c = create(:course_discussion_post, parent: root, topic: topic)

        { root: root, a: a, b: b, c: c } # Already in topographical order.
      end
      subject { graph[:root].topic.posts.ordered_topologically }

      it 'sorts the posts topographically' do
        root_post = subject.to_a.first
        expect(root_post.first).to eq(graph[:root])

        root_children = root_post.second
        expect(root_children).to contain_exactly([graph[:a], [
                                                   [graph[:b], []]]],
                                                 [graph[:c], []])
      end

      describe '#last' do
        it 'returns the last post topologically' do
          expect(subject.last).to eq(graph[:c])
        end

        context 'when there are no posts' do
          subject { topic.posts.ordered_topologically }

          it 'returns nil' do
            expect(subject.last).to be_nil
          end
        end
      end
    end
  end
end
