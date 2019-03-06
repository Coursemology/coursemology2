# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Post, type: :model do
  it { is_expected.to belong_to(:topic).inverse_of(:posts).touch(true) }
  it { is_expected.to have_many(:votes).inverse_of(:post).dependent(:destroy) }
  it { is_expected.to have_many(:children) }
  it { is_expected.to validate_presence_of(:text) }

  let(:instance) { Instance.default }
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

    describe '.ordered_topologically' do
      let(:topic) { create(:course_discussion_topic) }
      let(:graph) do
        # root -> a -> b
        #      \-> c
        root = create(:course_discussion_post, topic: topic)
        a = create(:course_discussion_post, parent: root, topic: topic)
        b = create(:course_discussion_post, parent: a, topic: topic)
        c = create(:course_discussion_post, parent: root, topic: topic)

        { root: root, a: a, b: b, c: c } # Already in topological order.
      end
      subject { graph[:root].topic.posts.reload.ordered_topologically }

      it 'sorts the posts topologically' do
        root_post = subject.to_a.first
        expect(root_post.first).to eq(graph[:root])

        root_children = root_post.second
        root_children_graph =
          [
            graph[:a],
            [
              [
                graph[:b], []
              ]
            ]
          ], [graph[:c], []]
        expect(root_children).to contain_exactly(*root_children_graph)
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

    describe '.with_user_votes' do
      let(:user) { create(:user) }
      let(:post) { create(:forum_topic).posts.first }
      let!(:vote) { post.votes.create(vote_flag: true, creator: user) }

      it 'preloads post votes from the specified user' do
        loaded_post = post.topic.posts.with_user_votes(user).first
        expect(loaded_post.votes).to be_loaded
        expect(loaded_post.votes.length).to eq(1)
        expect(loaded_post.votes.first.creator).to eq(user)
      end
    end

    describe '.upvotes' do
      let(:post) { create(:forum_topic).posts.first }
      let!(:vote) { post.votes.create(vote_flag: true) }

      it 'returns the number of upvotes on the post' do
        expect(post.topic.posts.calculated(:upvotes).first.upvotes).to eq(1)
      end
    end

    describe '.downvotes' do
      let(:post) { create(:forum_topic).posts.first }
      let!(:vote) { post.votes.create(vote_flag: false) }

      it 'returns the number of upvotes on the post' do
        expect(post.topic.posts.calculated(:upvotes).first.downvotes).to eq(1)
      end
    end

    describe '#vote_tally' do
      let(:post) { create(:forum_topic).posts.first }
      let!(:vote2) { post.votes.create(vote_flag: false, creator: create(:user)) }
      let!(:vote1) { post.votes.create(vote_flag: true, creator: create(:user)) }

      it 'sums the upvotes and subtracts the downvotes' do
        expect(post.topic.posts.calculated(:upvotes, :downvotes).first.vote_tally).to eq(0)
      end
    end

    describe '#vote_for' do
      let(:user) { create(:user) }
      let(:post) { create(:forum_topic).posts.first }

      context 'when the user specified has cast a vote' do
        let!(:vote) { post.votes.create(vote_flag: false, creator: user) }
        it 'returns the vote' do
          expect(post.vote_for(user)).to eq(vote)
        end
      end

      context 'when the user specified has not cast a vote' do
        it 'returns nil' do
          expect(post.vote_for(user)).to be_nil
        end
      end
    end

    describe '#cast_vote!' do
      let(:user) { create(:user) }
      let(:post) { create(:forum_topic).posts.first }
      context 'when the user has not cast a vote' do
        context 'when the user casts an upvote' do
          it 'increases the number of upvotes' do
            post.cast_vote!(user, 1)
            expect(post.topic.posts.calculated(:upvotes).first.upvotes).to eq(1)
          end
        end

        context 'when the user casts a downvote' do
          it 'increases the number of downvotes' do
            post.cast_vote!(user, -1)
            expect(post.topic.posts.calculated(:downvotes).first.downvotes).to eq(1)
          end
        end
      end

      context 'when the user has cast a vote' do
        let!(:vote) { post.votes.create(creator: user) }
        context 'when the user casts a null vote' do
          it 'decreases the total number of upvotes and downvotes' do
            post.cast_vote!(user, 0)
            calculated_post = post.topic.posts.calculated(:upvotes, :downvotes).first
            expect(calculated_post.upvotes - calculated_post.downvotes).to eq(0)
          end
        end
      end
    end

    describe '#author_name' do
      let(:user) { create(:user) }
      let(:post) { create(:course_discussion_post, creator: user) }

      context 'when the post creator is enrolled in the course' do
        let!(:course_user) { create(:course_student, course: post.topic.course, user: user) }

        it 'returns the CourseUser name' do
          expect(post.author_name).to eq(course_user.name)
        end
      end

      context 'when the post creator is not enrolled in the course' do
        it 'returns the User name' do
          expect(post.author_name).to eq(user.name)
        end
      end
    end

    describe 'callbacks' do
      context 'when post is destroyed' do
        let(:topic) { create(:course_discussion_topic) }
        let!(:parent_post) { create(:course_discussion_post, topic: topic) }
        let!(:post) { create(:course_discussion_post, parent: parent_post, topic: topic) }

        context 'when the post has children' do
          let!(:children_posts) do
            create_list(:course_discussion_post, 2, parent: post, topic: topic)
          end

          it 'makes them children of its parent' do
            post.destroy

            expect(children_posts.all? { |child| child.reload.parent_id == parent_post.id }).
              to be_truthy
          end

          context 'when the post is destroyed by association' do
            it 'destroys together with all children' do
              expect(topic.reload.destroy).to be_truthy
              all_posts_ids = topic.posts.map(&:id)
              expect(Course::Discussion::Post.where(id: all_posts_ids).exists?).
                to be_falsey
            end
          end
        end
      end

      context 'when post is saved' do
        let(:topic) { build(:course_discussion_topic, :with_post) }

        context 'when post is created with a topic' do
          it 'does not save the <script> tags' do
            topic.posts.first.text = "<script>alert('bad');</script>"
            topic.save!
            topic.reload
            expect(topic.posts.first.text).not_to include('script')
          end
        end

        context 'when a post is edited' do
          let(:post) do
            create(:course_discussion_post, topic: topic,
                                            text: "<script>alert('boo');</script>")
          end

          it 'does not save the <script> tags' do
            # `create` already saves the post and invokes the callback.
            expect(post.text).not_to include('script')
          end
        end
      end

      context 'after a commit' do
        let!(:topic) { create(:course_discussion_topic, :with_post) }
        let(:post_author) { create(:user) }
        let(:post) { create(:course_discussion_post, topic: topic, creator: post_author) }

        context 'when a new post is saved' do
          before do
            # Create post_author and set topic to be unread by post_author
            post_author && topic.touch
          end
          it 'marks the topic as read' do
            expect(topic.unread?(post_author)).to be_truthy
            post
            expect(topic.unread?(post_author)).to be_falsey
          end
        end

        context 'when the post exists' do
          before do
            # Create post and set topic to be updated to be unread
            post && topic.touch
          end

          context 'when the post is updated' do
            it 'marks the topic as read' do
              expect(topic.unread?(post_author)).to be_truthy
              post.text += 'foo'
              post.save
              expect(topic.unread?(post_author)).to be_falsey
            end
          end

          context 'when the post is deleted' do
            it 'marks the topic as read' do
              expect(topic.unread?(post_author)).to be_truthy
              post.destroy
              expect(topic.unread?(post_author)).to be_falsey
            end
          end
        end
      end
    end
  end
end
