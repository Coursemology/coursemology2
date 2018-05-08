# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::Topic, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject(:ability) { Ability.new(user) }
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let(:shown_topic) { build_stubbed(:forum_topic, forum: forum) }
    let(:hidden_topic) { build_stubbed(:forum_topic, :hidden, forum: forum) }
    let(:locked_topic) { build_stubbed(:forum_topic, :locked, forum: forum) }
    let(:question_topic) { build_stubbed(:forum_topic, topic_type: :question, forum: forum) }

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }
      let(:my_shown_topic) do
        build_stubbed(:forum_topic, forum: forum, hidden: false, creator: user)
      end
      let(:my_hidden_topic) do
        build_stubbed(:forum_topic, forum: forum, hidden: true, creator: user)
      end
      let(:my_question_topic) do
        build_stubbed(:forum_topic, forum: forum, topic_type: :question, creator: user)
      end

      it { is_expected.to be_able_to(:show, shown_topic) }
      it { is_expected.not_to be_able_to(:show, hidden_topic) }
      it { is_expected.to be_able_to(:create, shown_topic) }
      it { is_expected.to be_able_to(:update, my_shown_topic) }
      it { is_expected.not_to be_able_to(:update, my_hidden_topic) }
      it { is_expected.not_to be_able_to(:update, shown_topic) }
      it { is_expected.not_to be_able_to(:update, hidden_topic) }
      it { is_expected.to be_able_to(:reply, shown_topic) }
      it { is_expected.not_to be_able_to(:reply, locked_topic) }
      it { is_expected.to be_able_to(:toggle_answer, my_question_topic) }
      it { is_expected.not_to be_able_to(:toggle_answer, question_topic) }
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:manage, shown_topic) }
      it { is_expected.to be_able_to(:manage, hidden_topic) }
    end

    context 'when the user is a Course Observer' do
      let(:user) { create(:course_observer, course: course).user }

      it { is_expected.to be_able_to(:show, shown_topic) }
      it { is_expected.to be_able_to(:show, hidden_topic) }
      it { is_expected.not_to be_able_to(:manage, hidden_topic) }
      it { is_expected.not_to be_able_to(:manage, shown_topic) }
    end
  end
end
