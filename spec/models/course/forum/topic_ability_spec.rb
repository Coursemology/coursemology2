# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum::Topic, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject(:ability) { Ability.new(user, course, course_user) }
    let(:course) { create(:course, :with_rag_wise_component_enabled) }
    let(:forum) { create(:forum, course: course) }
    let(:shown_topic) { build_stubbed(:forum_topic, forum: forum) }
    let(:hidden_topic) { build_stubbed(:forum_topic, :hidden, forum: forum) }
    let(:locked_topic) { build_stubbed(:forum_topic, :locked, forum: forum) }
    let(:question_topic) { build_stubbed(:forum_topic, topic_type: :question, forum: forum) }

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }
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
      it { is_expected.to_not be_able_to(:publish, question_topic) }
      it { is_expected.to_not be_able_to(:generate_reply, question_topic) }
      it { is_expected.to_not be_able_to(:mark_answer_and_publish, question_topic) }
    end

    context 'when the user is a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, shown_topic) }
      it { is_expected.to be_able_to(:manage, hidden_topic) }
      it { is_expected.to be_able_to(:toggle_answer, question_topic) }
      it { is_expected.to be_able_to(:publish, question_topic) }
      it { is_expected.to be_able_to(:generate_reply, question_topic) }
      it { is_expected.to be_able_to(:mark_answer_and_publish, question_topic) }
    end

    context 'when the user is a Course Teaching Assistant' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, shown_topic) }
      it { is_expected.to be_able_to(:manage, hidden_topic) }
      it { is_expected.to be_able_to(:toggle_answer, question_topic) }
      it { is_expected.to be_able_to(:publish, question_topic) }
      it { is_expected.to be_able_to(:generate_reply, question_topic) }
      it { is_expected.to be_able_to(:mark_answer_and_publish, question_topic) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, shown_topic) }
      it { is_expected.to be_able_to(:show, hidden_topic) }
      it { is_expected.to be_able_to(:toggle_answer, question_topic) }
      it { is_expected.not_to be_able_to(:manage, hidden_topic) }
      it { is_expected.not_to be_able_to(:manage, shown_topic) }
      it { is_expected.to_not be_able_to(:publish, question_topic) }
      it { is_expected.to_not be_able_to(:generate_reply, question_topic) }
      it { is_expected.to_not be_able_to(:mark_answer_and_publish, question_topic) }
    end
  end
end
