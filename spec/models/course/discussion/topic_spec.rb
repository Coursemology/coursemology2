# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Topic, type: :model do
  it { is_expected.to be_actable }
  it { is_expected.to have_many(:posts).inverse_of(:topic).dependent(:destroy) }
  it { is_expected.to have_many(:subscriptions).inverse_of(:topic).dependent(:destroy) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:topic) { create(:forum_topic) }

    describe '#subscribed_by?' do
      let(:another_user) { create(:user) }
      let!(:discussion_topic_subscription) do
        create(:course_discussion_topic_subscription, topic: topic.acting_as, user: user)
      end

      context 'when the user has subscribed to a topic' do
        it 'returns true' do
          expect(topic.subscribed_by?(user)).to eq(true)
        end
      end

      context 'when the user has not subscribed to a topic' do
        it 'returns false' do
          expect(topic.subscribed_by?(another_user)).to eq(false)
        end
      end
    end

    describe '#ensure_subscribed_by' do
      context 'when the user has subscribed to a topic' do
        let!(:discussion_topic_subscription) do
          create(:course_discussion_topic_subscription, topic: topic.acting_as, user: user)
        end

        it 'returns true' do
          expect(topic.ensure_subscribed_by(user)).to eq(true)
        end
      end

      context 'when the user is invalid' do
        it 'raises RecordInvalid exception' do
          expect { topic.ensure_subscribed_by(nil) }.to raise_error(ActiveRecord::RecordInvalid)
        end
      end

      context 'when record already exists' do
        let!(:discussion_topic_subscription) do
          create(:course_discussion_topic_subscription, topic: topic.acting_as, user: user)
        end

        before do
          allow(topic.acting_as).to receive(:subscribed_by?).with(user).and_return(false)
        end

        it 'returns true' do
          expect(topic.ensure_subscribed_by(user)).to eq(true)
        end
      end
    end
  end
end
